
// supabase/functions/writing-scoring/index.ts
// ============================================================================
// PTE WRITING MODULE SCORING
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { questionType, submission, questionContent, userId, questionId } = await req.json();

        // Writing (Essay, Summarize Text) requires heavy AI evaluation.
        // Similar to 'ai-scoring', but here we can tune the prompt specifically for PTE Writing traits:
        // Content, Form, Grammar, Vocabulary, Spelling, Structure.

        return new Response(JSON.stringify({
            success: true,
            message: "Writing scoring function ready",
            questionType
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
