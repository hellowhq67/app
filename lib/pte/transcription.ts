'use server'

/**
 * Transcription service interface
 */
export interface TranscriptionResult {
  transcript: string
  text?: string // Alias for transcript for backward compatibility
  provider: string
  words?: Array<{
    word: string
    start: number
    end: number
    confidence?: number
  }>
}

export interface Transcriber {
  transcribe(params: { audioUrl: string }): Promise<TranscriptionResult>
}

/**
 * Get transcriber instance using AssemblyAI
 */
export async function getTranscriber(): Promise<Transcriber> {
  const apiKey = process.env.ASSEMBLYAI_API_KEY
  
  if (!apiKey) {
    console.warn('ASSEMBLYAI_API_KEY not found, transcription will fail')
  }

  return {
    async transcribe({ audioUrl }): Promise<TranscriptionResult> {
      if (!apiKey) {
        throw new Error('ASSEMBLYAI_API_KEY is not configured')
      }

      try {
        // Step 1: Submit transcription request to AssemblyAI
        const submitResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
          method: 'POST',
          headers: {
            'authorization': apiKey,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            audio_url: audioUrl,
            word_boost: ['PTE', 'academic', 'English', 'test'], // Boost PTE-related terms
            speaker_labels: false, // We don't need speaker diarization for single speaker
            punctuate: true,
            format_text: true,
            word_timestamps: true, // Get word-level timestamps
          }),
        })

        if (!submitResponse.ok) {
          const error = await submitResponse.json().catch(() => ({ error: 'Unknown error' }))
          throw new Error(`Failed to submit transcription: ${error.error || JSON.stringify(error)}`)
        }

        const { id } = await submitResponse.json()

        // Step 2: Poll for transcription completion
        let transcriptData: any = null
        let attempts = 0
        const maxAttempts = 60 // 5 minutes max (5 second intervals)
        const pollInterval = 3000 // Poll every 3 seconds for faster response

        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, pollInterval))

          const statusResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
            headers: {
              'authorization': apiKey,
            },
          })

          if (!statusResponse.ok) {
            const errorData = await statusResponse.json().catch(() => ({}))
            throw new Error(`Failed to check transcription status: ${errorData.error || statusResponse.statusText}`)
          }

          transcriptData = await statusResponse.json()

          if (transcriptData.status === 'completed') {
            break
          } else if (transcriptData.status === 'error') {
            throw new Error(`Transcription failed: ${transcriptData.error || 'Unknown error'}`)
          }

          // If processing or queued, continue polling
          if (transcriptData.status === 'processing' || transcriptData.status === 'queued') {
            attempts++
            continue
          }

          // Unknown status, break to avoid infinite loop
          console.warn(`Unknown transcription status: ${transcriptData.status}`)
          break
        }

        if (!transcriptData || transcriptData.status !== 'completed') {
          throw new Error(`Transcription ${transcriptData?.status === 'error' ? 'failed' : 'timed out'}. Status: ${transcriptData?.status || 'unknown'}`)
        }

        // Step 3: Extract transcript and word timestamps
        const transcript = transcriptData.text || ''
        const words = transcriptData.words?.map((w: any) => ({
          word: w.text,
          start: Math.round(w.start),
          end: Math.round(w.end),
          confidence: w.confidence,
        })) || []

        return {
          transcript,
          text: transcript, // Alias for backward compatibility
          provider: 'assemblyai',
          words,
        }
      } catch (error) {
        console.error('AssemblyAI transcription error:', error)
        // Return empty transcript on error instead of throwing
        // This allows the scoring to continue even if transcription fails
        return {
          transcript: '',
          text: '',
          provider: 'none',
          words: [],
        }
      }
    },
  }
}

