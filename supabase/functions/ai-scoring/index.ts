import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

serve(async (req: any) => {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { questionType, submission, questionContent, userId, questionId } =
            await req.json();

        if (!questionType || !submission) {
            throw new Error("Missing required fields: questionType, submission");
        }

        // 1. Initialize Supabase Client (for Vector Search)
        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
        const supabase = createClient(supabaseUrl, supabaseKey);

        // 2. Initialize Gemini
        const googleApiKey = Deno.env.get("GOOGLE_GENERATIVE_AI_API_KEY") ?? "";
        if (!googleApiKey) throw new Error("Missing GOOGLE_GENERATIVE_AI_API_KEY");
        const genAI = new GoogleGenerativeAI(googleApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Use Flash for speed/cost

        // 3. Vector Search: Find User's "Weak Areas" (Pattern Matching)
        // We embed the current question content to see if it matches previous weak areas
        let weakAreasContext = "";
        if (userId && questionContent) {
            const embeddingModel = genAI.getGenerativeModel({
                model: "embedding-001",
            });
            const embeddingResult = await embeddingModel.embedContent(
                questionContent
            );
            const embedding = embeddingResult.embedding.values;

            const { data: similarWeaknesses, error: searchError } =
                await supabase.rpc("match_user_weak_areas", {
                    user_id_param: userId,
                    query_embedding: embedding,
                    match_threshold: 0.7,
                    match_count: 3,
                });

            if (!searchError && similarWeaknesses && similarWeaknesses.length > 0) {
                weakAreasContext = `\n\nUser's Past Weaknesses in this context:\n${similarWeaknesses
                    .map((w: any) => `- ${w.weakness_description}`)
                    .join("\n")}\nPay special attention to these potential pitfalls.`;
            }
        }

        // 4. Construct Prompt
        let userContent = `Question Prompt: ${questionContent}\n\n`;

        // Handle Audio (URL) or Text
        if (submission.audioUrl) {
            // In a real Edge Function, we might need to fetch the audio blob and send it as data
            // OR rely on Gemini 1.5 Pro's ability to process audio URL if publicly accessible (likely not directly unless signed).
            // Implementation Strategy:
            // For this demo, we assume we have a transcript OR we pass the text if available.
            // If we strictly need audio processing in Edge Function, we would fetch the blob.

            // However, standard Gemini API often takes base64 data for inline media.
            // We'll proceed assuming we might have a transcript passed or we need to handle text.
            // If 'transcript' is passed in submission:
            if (submission.transcript) {
                userContent += `User Audio Transcript: ${submission.transcript}\n\n`;
            } else {
                userContent += `[Audio URL provided: ${submission.audioUrl} - *Note: Audio processing requires fetching and converting to base64, usually handled before or using a transcription service. For this prototype, we assume transcript is passed or we evaluate available text.*]\n\n`;
            }
        } else if (submission.text) {
            userContent += `User Text Response: ${submission.text}\n\n`;
        }

        userContent += weakAreasContext;
        userContent += `\nPlease evaluate this response for a PTE Academic ${questionType} question. Return a JSON object with: { overallScore, pronunciation (if audio), fluency (if audio), content, grammar, vocabulary, spelling, structure, accuracy, suggestions: [], strengths: [], areasForImprovement: [] }. Only return valid JSON.`;

        // 5. Generate Scoring
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: userContent }] }],
            generationConfig: { responseMimeType: "application/json" },
        });

        const responseText = result.response.text();
        const feedbackData = JSON.parse(responseText);

        // 6. Save "Weak Areas" Analysis (Asynchronous / Side Effect)
        // If score is low (< 50 example), we generate an embedding of the feedback and save it as a "weak area"
        if (feedbackData.overallScore < 50 && userId && questionContent) {
            const weaknessDesc = `Struggled with ${questionType}: ${feedbackData.areasForImprovement?.[0] ?? "General difficulty"
                }`;
            const embeddingModel = genAI.getGenerativeModel({
                model: "embedding-001",
            });
            const embeddingResult = await embeddingModel.embedContent(weaknessDesc);

            await supabase.from("user_weak_areas").insert({
                user_id: userId,
                question_type: questionType,
                weakness_description: weaknessDesc,
                embedding: embeddingResult.embedding.values,
            });
        }

        return new Response(JSON.stringify(feedbackData), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
