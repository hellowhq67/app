import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("audio") as File
    const userId = formData.get("userId") as string
    const questionId = formData.get("questionId") as string

    if (!file) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `recordings/${userId}/${questionId}_${timestamp}.webm`

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
    })

    return NextResponse.json({
      url: blob.url,
      filename: filename,
      size: file.size,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
