'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getSession as getServerSession } from '@/lib/pte/attempts'
import CountdownTimer from './CountdownTimer'

type Props = {
  // Authoritative section window (server-based)
  startTsServer: number // epoch ms (from /api/attempts/session)
  endTsServer: number // epoch ms (from /api/attempts/session)
  // Optional token for revalidation
  token?: string
  // UI
  label?: string
  srLabel?: string
  className?: string
  // Events
  onTick?: (remainingMs: number) => void
  onExpireSection?: () => void
  // Re-sync cadence (ms) when page becomes visible or periodically
  // Default behavior: re-sync on visibilitychange; optional periodic sync can be enabled via pollMs
  pollMs?: number // e.g., 15_000
}

/**
 * SectionTimer
 * - Renders a non-pausing section-wide countdown
 * - Re-syncs with server on visibilitychange and optional periodic polling
 * - Emits onExpireSection when time is up (client-side)
 *
 * Accessibility:
 * - Announces the countdown via inner CountdownTimer live regions
 * - Color shift for last 10s handled by CountdownTimer
 */
export default function SectionTimer({
  startTsServer,
  endTsServer,
  token,
  label = 'Section time remaining',
  srLabel = 'Section countdown timer',
  className,
  onTick,
  onExpireSection,
  pollMs,
}: Props) {
  const [startAt, setStartAt] = useState<number>(startTsServer)
  const [endAt, setEndAt] = useState<number>(endTsServer)
  const [syncing, setSyncing] = useState<boolean>(false)
  const pollRef = useRef<number | null>(null)

  const durationMs = useMemo(() => {
    return Math.max(0, endAt - startAt)
  }, [startAt, endAt])

  const doResync = useCallback(async () => {
    if (!token) return
    try {
      setSyncing(true)
      const s = await getServerSession(token)
      // Only update if server window differs materially (e.g., clock drift or renewed window)
      const deltaStart = Math.abs(s.startAt - startAt)
      const deltaEnd = Math.abs(s.endAt - endAt)
      if (deltaStart > 1000 || deltaEnd > 1000) {
        console.log('[SectionTimer] re-synced window', {
          startAt: s.startAt,
          endAt: s.endAt,
        })
        setStartAt(s.startAt)
        setEndAt(s.endAt)
      }
    } catch (e) {
      // Non-fatal; keep current view
      console.warn('[SectionTimer] re-sync failed:', (e as Error)?.message)
    } finally {
      setSyncing(false)
    }
  }, [token, startAt, endAt])

  // Re-sync on visibility change (PTE-like non-pausable)
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible') {
        void doResync()
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [doResync])

  // Optional periodic re-sync polling
  useEffect(() => {
    if (!pollMs || pollMs < 5000) return
    const id = window.setInterval(() => {
      void doResync()
    }, pollMs)
    pollRef.current = id
    return () => {
      if (pollRef.current) {
        window.clearInterval(pollRef.current)
        pollRef.current = null
      }
    }
  }, [doResync, pollMs])

  // Handle expiry
  const handleExpire = useCallback(() => {
    console.log('[SectionTimer] section expired; emitting onExpireSection')
    try {
      onExpireSection?.()
    } catch (e) {
      console.error('[SectionTimer] onExpireSection error', e)
    }
  }, [onExpireSection])

  return (
    <div className={className} role="group" aria-label={srLabel}>
      <CountdownTimer
        durationMs={durationMs}
        startTsServer={startAt}
        endTsServer={endAt}
        onTick={onTick}
        onExpire={handleExpire}
        label={label + (syncing ? ' · syncing…' : '')}
        srLabel={srLabel}
      />
    </div>
  )
}
