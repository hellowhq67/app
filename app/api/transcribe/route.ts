import { put } from "@vercel/blob";
import { getTranscriber } from "@/lib/pte/transcription";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get the audio file from the form data
    const formData = await request.formData();
    const audioFile = formData.get("file") as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    // Upload the audio file to Vercel Blob
    const timestamp = Date.now();
    const fileName = `transcription/${timestamp}-${audioFile.name}`;

    const blob = await put(fileName, audioFile, {
      access: "public",
    });

    // Get the transcriber and transcribe the audio
    const transcriber = await getTranscriber();
    const result = await transcriber.transcribe({ audioUrl: blob.url });

    // Return the transcription result
    return NextResponse.json({
      text: result.transcript,
      transcript: result.transcript,
      provider: result.provider,
      words: result.words,
      audioUrl: blob.url,
    });
  } catch (error) {
    console.error("Transcription API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Transcription failed" },
      { status: 500 }
    );
  }
}
