import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from '@testing-library/react'
import { usePracticeSession } from '../../lib/store/practice-session'

// Reset Zustand store state between tests
beforeEach(() => {
  usePracticeSession.setState({
    questionId: null,
    questionType: null,
    practiceType: null,
    status: 'idle',
    isSubmitting: false,
    audioBlob: null,
    textAnswer: '',
    selectedOptions: null,
    result: null,
    attempts: [],
  })
})

describe('usePracticeSession — initial state', () => {
  it('starts in idle state with no data', () => {
    const state = usePracticeSession.getState()
    expect(state.status).toBe('idle')
    expect(state.questionId).toBeNull()
    expect(state.questionType).toBeNull()
    expect(state.practiceType).toBeNull()
    expect(state.isSubmitting).toBe(false)
    expect(state.audioBlob).toBeNull()
    expect(state.textAnswer).toBe('')
    expect(state.selectedOptions).toBeNull()
    expect(state.result).toBeNull()
  })
})

describe('usePracticeSession — initSession', () => {
  it('sets question context and resets answer state', () => {
    const { initSession } = usePracticeSession.getState()

    act(() => {
      initSession('q-123', 'read_aloud', 'speaking')
    })

    const state = usePracticeSession.getState()
    expect(state.questionId).toBe('q-123')
    expect(state.questionType).toBe('read_aloud')
    expect(state.practiceType).toBe('speaking')
    expect(state.status).toBe('idle')
    expect(state.result).toBeNull()
    expect(state.textAnswer).toBe('')
    expect(state.audioBlob).toBeNull()
  })

  it('clears previous session data when re-initializing', () => {
    const store = usePracticeSession.getState()
    act(() => {
      store.initSession('q-1', 'read_aloud', 'speaking')
      store.setTextAnswer('some previous answer')
    })

    act(() => {
      usePracticeSession.getState().initSession('q-2', 'write_essay', 'writing')
    })

    const state = usePracticeSession.getState()
    expect(state.questionId).toBe('q-2')
    expect(state.textAnswer).toBe('')
  })
})

describe('usePracticeSession — setRecording', () => {
  it('stores audio blob and transitions to answering status', () => {
    const blob = new Blob(['audio data'], { type: 'audio/wav' })
    act(() => {
      usePracticeSession.getState().setRecording(blob)
    })

    const state = usePracticeSession.getState()
    expect(state.audioBlob).toBe(blob)
    expect(state.status).toBe('answering')
  })
})

describe('usePracticeSession — setTextAnswer', () => {
  it('stores text and transitions to answering status', () => {
    act(() => {
      usePracticeSession.getState().setTextAnswer('My essay answer')
    })

    const state = usePracticeSession.getState()
    expect(state.textAnswer).toBe('My essay answer')
    expect(state.status).toBe('answering')
  })
})

describe('usePracticeSession — setOptions', () => {
  it('stores selected options and transitions to answering status', () => {
    act(() => {
      usePracticeSession.getState().setOptions(['A', 'C'])
    })

    const state = usePracticeSession.getState()
    expect(state.selectedOptions).toEqual(['A', 'C'])
    expect(state.status).toBe('answering')
  })
})

describe('usePracticeSession — setStatus', () => {
  it('updates status directly', () => {
    act(() => {
      usePracticeSession.getState().setStatus('preparing')
    })
    expect(usePracticeSession.getState().status).toBe('preparing')
  })
})

describe('usePracticeSession — submitAttempt', () => {
  it('transitions to submitting then completed on success', async () => {
    const mockResult = { score: 75, feedback: 'Good job' }
    const submitFn = vi.fn().mockResolvedValue(mockResult)

    await act(async () => {
      await usePracticeSession.getState().submitAttempt(submitFn)
    })

    const state = usePracticeSession.getState()
    expect(state.status).toBe('completed')
    expect(state.isSubmitting).toBe(false)
    expect(state.result).toEqual(mockResult)
    expect(submitFn).toHaveBeenCalledOnce()
  })

  it('reverts to answering on failure', async () => {
    const submitFn = vi.fn().mockRejectedValue(new Error('Network error'))

    await act(async () => {
      try {
        await usePracticeSession.getState().submitAttempt(submitFn)
      } catch {
        // expected
      }
    })

    const state = usePracticeSession.getState()
    expect(state.status).toBe('answering')
    expect(state.isSubmitting).toBe(false)
    expect(state.result).toBeNull()
  })

  it('does not submit twice if already submitting', async () => {
    // Manually set status to submitting
    usePracticeSession.setState({ status: 'submitting' })

    const submitFn = vi.fn().mockResolvedValue({ score: 80 })
    await act(async () => {
      await usePracticeSession.getState().submitAttempt(submitFn)
    })

    expect(submitFn).not.toHaveBeenCalled()
  })
})

describe('usePracticeSession — resetSession', () => {
  it('resets to idle state preserving no answer data', () => {
    const store = usePracticeSession.getState()

    act(() => {
      store.initSession('q-1', 'read_aloud', 'speaking')
      store.setTextAnswer('Some text')
    })

    act(() => {
      usePracticeSession.getState().resetSession()
    })

    const state = usePracticeSession.getState()
    expect(state.status).toBe('idle')
    expect(state.textAnswer).toBe('')
    expect(state.audioBlob).toBeNull()
    expect(state.selectedOptions).toBeNull()
    expect(state.result).toBeNull()
  })

  it('preserves questionId and questionType after reset', () => {
    act(() => {
      usePracticeSession.getState().initSession('q-999', 'write_essay', 'writing')
    })
    act(() => {
      usePracticeSession.getState().resetSession()
    })

    // Reset does NOT clear context — that's intentional per the implementation
    const state = usePracticeSession.getState()
    expect(state.questionId).toBe('q-999')
  })
})
