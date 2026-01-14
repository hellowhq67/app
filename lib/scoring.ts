// Mock implementation of scoring logic for PTE Practice
// Replacing Supabase Edge Function calls with local mocks

import { PTE_QUESTION_TYPES } from "@/constants/pte-constants";

export interface ScoreResult {
  overallScore: number;
  content: number;
  fluency: number;
  pronunciation: number;
  feedback: string[];
  detailedAnalysis: {
    strengths: string[];
    improvements: string[];
    tips: string[];
  };
}

export type TestType =
  | typeof PTE_QUESTION_TYPES.READ_ALOUD
  | typeof PTE_QUESTION_TYPES.REPEAT_SENTENCE
  | typeof PTE_QUESTION_TYPES.DESCRIBE_IMAGE
  | typeof PTE_QUESTION_TYPES.RETELL_LECTURE
  | typeof PTE_QUESTION_TYPES.ANSWER_SHORT_QUESTION
  | typeof PTE_QUESTION_TYPES.SUMMARIZE_SPOKEN_TEXT
  // "read-and-retell" // Not in standard constants, removing to align types
  | typeof PTE_QUESTION_TYPES.SUMMARIZE_GROUP_DISCUSSION
  | typeof PTE_QUESTION_TYPES.RESPOND_TO_SITUATION;

interface ScoringParams {
  testType: TestType;
  spokenText: string;
  originalText?: string;
  imageDescription?: string;
  lectureContent?: string;
  question?: string;
  expectedAnswer?: string;
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  // Mock transcription
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real scenario, we would send the blob to a transcription service
      resolve("The library is an excellent place to study. It provides a quiet environment where students can focus on their work.");
    }, 1500);
  });
}

export async function scoreSpeaking(params: ScoringParams): Promise<ScoreResult> {
  // Mock scoring
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        overallScore: 85,
        content: 80,
        fluency: 90,
        pronunciation: 85,
        feedback: ["Great job! Your pronunciation is very clear.", "Try to maintain a steady pace."],
        detailedAnalysis: {
          strengths: ["Clear enunciation", "Good volume", "Natural pausing"],
          improvements: ["Some minor hesitation", "Stress on some words could be better"],
          tips: ["Practice reading aloud daily", "Record yourself and listen back"]
        }
      });
    }, 1500);
  });
}

// Helper to convert blob to base64 if needed later
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
