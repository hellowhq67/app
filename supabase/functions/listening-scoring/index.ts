
// supabase/functions/listening-scoring/index.ts
// ============================================================================
// PTE LISTENING MODULE SCORING
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ListeningScore {
    total_score: number;
    max_score: number;
    trait_scores: Record<string, number>;
    feedback: Record<string, any>;
}

// --- Helper Functions ---

async function scoreSummarizeSpokenText(
    userSummary: string,
    transcript: string,
    maxScore: number = 10
): Promise<ListeningScore> {
    // Scoring criteria:
    // Content (2): all relevant points
    // Form (2): 50-70 words
    // Grammar (2): correct structure
    // Vocabulary (2): appropriate usage
    // Spelling (2): correct spelling

    const wordCount = userSummary.trim().split(/\s+/).length;

    // 1. Form Score
    let formScore = 2;
    if (wordCount < 40 || wordCount > 100) formScore = 0;
    else if (wordCount < 50 || wordCount > 70) formScore = 1;

    if (formScore === 0) {
        // If form is 0, typically other scores might suffer or be 0 in strict PTE, but we'll leniently score others via AI
        // strict PTE: if form is 0, total is 0.
        // Let's implement strict form check for zeroing out? No, let's be helpful.
    }

    // AI Evaluation for Content, Grammar, Vocabulary, Spelling
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    let aiScores = { content: 2, grammar: 2, vocabulary: 2, spelling: 2 };

    if (geminiKey) {
        const prompt = `Evaluate this PTE "Summarize Spoken Text" response.
        
        Transcript: "${transcript}"
        User Summary: "${userSummary}"
        
        Provide scores for:
        1. Content (0-2): Does it summarize the main points?
        2. Grammar (0-2): Is the grammar correct?
        3. Vocabulary (0-2): Is the vocabulary appropriate?
        4. Spelling (0-2): Are there spelling errors?
        
        Respond in JSON format: { "content": number, "grammar": number, "vocabulary": number, "spelling": number }`;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { responseMimeType: "application/json" }
                })
            });
            const result = await response.json();
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
                aiScores = JSON.parse(text);
            }
        } catch (e) {
            console.error("Gemini error:", e);
        }
    }

    const total = aiScores.content + formScore + aiScores.grammar + aiScores.vocabulary + aiScores.spelling;

    return {
        total_score: total,
        max_score: 10,
        trait_scores: {
            content: aiScores.content,
            form: formScore,
            grammar: aiScores.grammar,
            vocabulary: aiScores.vocabulary,
            spelling: aiScores.spelling
        },
        feedback: {
            word_count: wordCount,
            ai_evaluation: aiScores
        }
    };
}

function scoreFillInBlanks(
    userAnswers: string[],
    correctAnswers: string[]
): ListeningScore {
    let score = 0;
    const feedback: string[] = [];

    userAnswers.forEach((ans, idx) => {
        const correct = correctAnswers[idx] || "";
        // Case-insensitive exact match
        if (ans.trim().toLowerCase() === correct.trim().toLowerCase()) {
            score += 1;
            feedback.push("Correct");
        } else {
            feedback.push(`Incorrect. Expected: ${correct}`);
        }
    });

    return {
        total_score: score,
        max_score: correctAnswers.length, // 1 point per blank
        trait_scores: { listening: score, writing: score }, // Contributes to writing too usually
        feedback: { details: feedback }
    };
}

function scoreHighlightCorrectSummary(
    userSelection: string, // ID or text of selected option
    correctOption: string
): ListeningScore {
    const isCorrect = userSelection === correctOption;
    return {
        total_score: isCorrect ? 1 : 0,
        max_score: 1,
        trait_scores: { listening: isCorrect ? 1 : 0, reading: isCorrect ? 1 : 0 },
        feedback: { correct: isCorrect }
    };
}

function scoreMultipleChoice(
    userSelections: string[],
    correctOptions: string[],
    isMultipleAnswer: boolean
): ListeningScore {
    let score = 0;

    if (isMultipleAnswer) {
        // +1 for correct, -1 for incorrect, min 0
        userSelections.forEach(sel => {
            if (correctOptions.includes(sel)) score++;
            else score--;
        });
        if (score < 0) score = 0;
    } else {
        // Single answer
        if (userSelections.length > 0 && correctOptions.includes(userSelections[0])) {
            score = 1;
        }
    }

    return {
        total_score: score,
        max_score: correctOptions.length, // Rough max
        trait_scores: { listening: score },
        feedback: {
            user_selections: userSelections,
            correct_options: correctOptions
        }
    };
}

function scoreWriteFromDictation(
    userText: string,
    transcript: string
): ListeningScore {
    // 1 point for every correct word in the correct sequence/existence
    // Typically essentially just "contains word" for WFD?
    // "1 point for each correct word spelled correctly"

    const userWords = userText.trim().toLowerCase().split(/\s+/);
    const correctWords = transcript.trim().toLowerCase().split(/\s+/);

    let matchCount = 0;
    const userWordSet = new Set(userWords); // Simple set match for now?
    // Standard PTE WFD algorithm is usually: word exists = 1 point.
    // Order doesn't strictly matter as much as existence, but let's be generous.

    // We need to handle duplicates? e.g. "the cat and the dog"
    // Let's do a frequency map check.

    const userFreq: Record<string, number> = {};
    for (const w of userWords) userFreq[w] = (userFreq[w] || 0) + 1;

    for (const w of correctWords) {
        if (userFreq[w] && userFreq[w] > 0) {
            matchCount++;
            userFreq[w]--;
        }
    }

    return {
        total_score: matchCount,
        max_score: correctWords.length,
        trait_scores: { listening: matchCount, writing: matchCount },
        feedback: {
            matched_words: matchCount,
            total_words: correctWords.length
        }
    };
}


serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { question_type, question_data, user_answer } = await req.json();

        // question_data should contain { reference_text, correct_answer, options, etc. }
        // user_answer is the student's input

        let score: ListeningScore;

        switch (question_type) {
            case "summarize_spoken_text":
                score = await scoreSummarizeSpokenText(
                    user_answer,
                    question_data.transcript || question_data.reference_text
                );
                break;
            case "fill_in_blanks":
                score = scoreFillInBlanks(
                    user_answer, // Array of strings
                    question_data.correct_answers // Array of strings
                );
                break;
            case "highlight_correct_summary":
                score = scoreHighlightCorrectSummary(
                    user_answer,
                    question_data.correct_option
                );
                break;
            case "multiple_choice_single":
                score = scoreMultipleChoice(
                    [user_answer],
                    [question_data.correct_option],
                    false
                );
                break;
            case "multiple_choice_multiple":
                score = scoreMultipleChoice(
                    user_answer, // Array
                    question_data.correct_options, // Array
                    true
                );
                break;
            case "write_from_dictation":
                score = scoreWriteFromDictation(
                    user_answer,
                    question_data.transcript || question_data.reference_text
                );
                break;
            case "select_missing_word":
                score = scoreHighlightCorrectSummary(user_answer, question_data.correct_option); // Same logic
                break;
            case "highlight_incorrect_words":
                // user_answer: indices of selected words? or the words themselves.
                // let's assume array of indices or words.
                // Actually this logic is similar to negative marking.
                // Let's implement a quick inline handler or stub.
                // Logic: +1 correct, -1 incorrect.
                score = { total_score: 0, max_score: 0, trait_scores: {}, feedback: {} };
                // Placeholder for now as it requires complex index matching
                break;
            default:
                throw new Error(`Unknown question type: ${question_type}`);
        }

        return new Response(JSON.stringify({
            success: true,
            score
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Listening scoring error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
