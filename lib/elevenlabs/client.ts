'use server'

/**
 * ElevenLabs API Client
 * 
 * This module provides server-side functions to interact with ElevenLabs API
 * for generating conversation tokens and signed URLs.
 */

const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io/v1'

export interface ElevenLabsConfig {
  apiKey: string
  agentId?: string
}

/**
 * Get a conversation token for WebRTC connection
 */
export async function getConversationToken(agentId: string, apiKey: string): Promise<string> {
  try {
    const response = await fetch(
      `${ELEVENLABS_API_BASE}/convai/conversation/token?agent_id=${agentId}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': apiKey,
        },
      }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to get conversation token: ${error}`)
    }

    const data = await response.json()
    return data.token
  } catch (error) {
    console.error('Error getting conversation token:', error)
    throw error
  }
}

/**
 * Get a signed URL for WebSocket connection
 */
export async function getSignedUrl(agentId: string, apiKey: string): Promise<string> {
  try {
    const response = await fetch(
      `${ELEVENLABS_API_BASE}/convai/conversation/get-signed-url?agent_id=${agentId}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': apiKey,
        },
      }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to get signed URL: ${error}`)
    }

    const data = await response.json()
    return data.signed_url
  } catch (error) {
    console.error('Error getting signed URL:', error)
    throw error
  }
}
