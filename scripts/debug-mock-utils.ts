import { QuestionType } from "@/lib/types";

// COPIED FROM scoring-mock.ts for isolation
function normalizeText(text: string): string {
    return text.toLowerCase()
        .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
        .replace(/\s{2,}/g, " ")
        .trim();
}

function scoreReadAloud(transcript: string, promptText: string) {
    const cleanTranscript = normalizeText(transcript);
    const cleanPrompt = normalizeText(promptText);

    console.log('Clean Transcript:', cleanTranscript);
    console.log('Clean Prompt:    ', cleanPrompt);

    const promptWords = cleanPrompt.split(' ');
    const transcriptWords = cleanTranscript.split(' ');

    console.log('Prompt Words:', promptWords);
    console.log('Trans Words :', transcriptWords);

    let matches = 0;
    let promptIndex = 0;

    for (let tIndex = 0; tIndex < transcriptWords.length; tIndex++) {
        const word = transcriptWords[tIndex];
        if (promptIndex < promptWords.length && word === promptWords[promptIndex]) {
            matches++;
            promptIndex++;
        } else {
            const lookAheadLimit = 2;
            let found = false;
            for (let i = 1; i <= lookAheadLimit; i++) {
                if (promptIndex + i < promptWords.length && word === promptWords[promptIndex + i]) {
                    console.log(`Skipped to match '${word}' at index ${promptIndex + i} (was expecting '${promptWords[promptIndex]}')`);
                    matches++;
                    promptIndex += i + 1;
                    found = true;
                    break;
                }
            }
        }
    }

    const contentPercentage = matches / Math.max(1, promptWords.length);
    console.log(`Matches: ${matches}/${promptWords.length} (${(contentPercentage * 100).toFixed(1)}%)`);

    const contentScore = contentPercentage >= 1 ? 5 :
        contentPercentage >= 0.8 ? 4 :
            contentPercentage >= 0.6 ? 3 :
                contentPercentage >= 0.4 ? 2 :
                    contentPercentage >= 0.2 ? 1 : 0;
    console.log('Content Score:', contentScore);
}

const t = 'The best time to visit Canada is typically between spring and fall particularly specifically the months of April and October.';
const p = 'The best time to visit Canada is typically between spring and fall, particularly specifically the months of April and October.';
scoreReadAloud(t, p);
