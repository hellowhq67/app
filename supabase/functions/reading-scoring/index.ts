
// supabase/functions/reading-scoring/index.ts
// ============================================================================
// PTE READING MODULE SCORING
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

        // Reading is mostly deterministic (right/wrong), but Reorder Paragraphs might need logic.
        // Fill in Blanks is also deterministic.
        // We can use this function to validate answers securely on the server side.

        return new Response(JSON.stringify({
            success: true,
            message: "Reading scoring function ready",
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
