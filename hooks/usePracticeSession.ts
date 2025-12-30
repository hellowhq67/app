'use client'

import { useState, useEffect, useCallback } from 'react'
import { realtimeManager } from '@/lib/supabase/realtime'
import { scoringService, ScoringRequest } from '@/lib/supabase/scoring'
import { supabase } from '@/lib/supabaseClient'
import { PracticeSession, QuestionResponse, NewPracticeSession, NewQuestionResponse } from '@/lib/supabase/database'

export function usePracticeSession() {
  const [session, setSession] = useState<PracticeSession | null>(null)
  const [responses, setResponses] = useState<QuestionResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create a new practice session
  const createSession = async (sessionData: Omit<NewPracticeSession, 'user_id'>) => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('practice_sessions')
        .insert({
          ...sessionData,
          user_id: user.id
        })
        .select()
        .single()

      if (error) throw error

      setSession(data)
      setResponses([])

      // Subscribe to realtime updates for this session
      realtimeManager.subscribeToSession(data.id, {
        onSessionUpdate: (updatedSession) => setSession(updatedSession),
        onQuestionResponse: (newResponse) => setResponses(prev => [...prev, newResponse])
      })

      return { data }
    } catch (error: any) {
      setError(error.message)
      return { error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Load an existing session
  const loadSession = async (sessionId: string) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('practice_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (error) throw error

      setSession(data)

      // Load responses for this session
      const { data: responsesData, error: responsesError } = await supabase
        .from('question_responses')
        .select('*')
        .eq('session_id', sessionId)
        .order('sequence_number', { ascending: true })

      if (responsesError) throw responsesError

      setResponses(responsesData || [])

      // Subscribe to realtime updates
      realtimeManager.subscribeToSession(sessionId, {
        onSessionUpdate: (updatedSession) => setSession(updatedSession),
        onQuestionResponse: (newResponse) => setResponses(prev => [...prev, newResponse])
      })

      return { data }
    } catch (error: any) {
      setError(error.message)
      return { error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Submit a question response
  const submitResponse = async (
    questionType: string,
    questionSection: string,
    questionData: any,
    responseData: {
      text?: string
      audioUrl?: string
      metadata?: Record<string, any>
    }
  ) => {
    if (!session) return { error: 'No active session' }

    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const sequenceNumber = responses.length + 1

      // Create the response record
      const { data: newResponse, error } = await supabase
        .from('question_responses')
        .insert({
          session_id: session.id,
          user_id: user.id,
          question_type: questionType,
          question_section: questionSection,
          question_data: questionData,
          sequence_number: sequenceNumber,
          response_text: responseData.text,
          response_audio_url: responseData.audioUrl,
          response_data: responseData.metadata || {},
          submitted_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Add to local state immediately
      setResponses(prev => [...prev, newResponse])

      // Submit for AI scoring
      const scoringRequest: ScoringRequest = {
        responseId: newResponse.id,
        questionType,
        questionSection,
        responseData
      }

      const scoringResult = await scoringService.submitForScoring(scoringRequest)
      
      if (!scoringResult.success) {
        console.error('Scoring failed:', scoringResult.error)
      }

      return { data: newResponse }
    } catch (error: any) {
      setError(error.message)
      return { error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Complete the session
  const completeSession = async () => {
    if (!session) return { error: 'No active session' }

    setLoading(true)
    setError(null)

    try {
      const duration = Math.round(
        (Date.now() - new Date(session.started_at).getTime()) / 60000
      )

      // Calculate scores from responses
      const completedResponses = responses.filter(r => r.score !== null)
      const scores = {
        overall: completedResponses.length > 0 
          ? completedResponses.reduce((sum, r) => sum + (r.score || 0), 0) / completedResponses.length 
          : 0,
        speaking: completedResponses.filter(r => r.question_section === 'Speaking & Writing' && r.question_type.includes('Speaking'))
          .reduce((sum, r) => sum + (r.score || 0), 0) / Math.max(1, completedResponses.filter(r => r.question_section === 'Speaking & Writing' && r.question_type.includes('Speaking')).length),
        writing: completedResponses.filter(r => r.question_section === 'Speaking & Writing' && !r.question_type.includes('Speaking'))
          .reduce((sum, r) => sum + (r.score || 0), 0) / Math.max(1, completedResponses.filter(r => r.question_section === 'Speaking & Writing' && !r.question_type.includes('Speaking')).length),
        reading: completedResponses.filter(r => r.question_section === 'Reading')
          .reduce((sum, r) => sum + (r.score || 0), 0) / Math.max(1, completedResponses.filter(r => r.question_section === 'Reading').length),
        listening: completedResponses.filter(r => r.question_section === 'Listening')
          .reduce((sum, r) => sum + (r.score || 0), 0) / Math.max(1, completedResponses.filter(r => r.question_section === 'Listening').length)
      }

      const { data, error } = await supabase
        .from('practice_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          duration_minutes: duration,
          total_questions: responses.length,
          overall_score: scores.overall,
          speaking_score: scores.speaking || null,
          writing_score: scores.writing || null,
          reading_score: scores.reading || null,
          listening_score: scores.listening || null
        })
        .eq('id', session.id)
        .select()
        .single()

      if (error) throw error

      setSession(data)

      // Unsubscribe from realtime updates
      realtimeManager.unsubscribe(`session:${session.id}`)

      return { data }
    } catch (error: any) {
      setError(error.message)
      return { error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Get response with scoring
  const getResponseWithScoring = async (responseId: string) => {
    try {
      const scoredResponse = await scoringService.waitForScoring(responseId)
      
      if (scoredResponse) {
        setResponses(prev => 
          prev.map(r => r.id === responseId ? scoredResponse : r)
        )
      }

      return scoredResponse
    } catch (error: any) {
      setError(error.message)
      return null
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (session) {
        realtimeManager.unsubscribe(`session:${session.id}`)
      }
    }
  }, [session?.id])

  return {
    session,
    responses,
    loading,
    error,
    createSession,
    loadSession,
    submitResponse,
    completeSession,
    getResponseWithScoring,
    clearError: () => setError(null)
  }
}
