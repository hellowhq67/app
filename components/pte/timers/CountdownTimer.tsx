import React from 'react'

interface CountdownTimerProps {
    durationMs: number
    startTsServer: number
    endTsServer?: number
    onExpire?: () => void
    label?: string
    srLabel?: string
}

export default function CountdownTimer({
    durationMs,
    label,
    srLabel,
}: CountdownTimerProps) {
    return (
        <div className="flex items-center gap-2" aria-label={srLabel}>
            {label && <span className="text-sm font-medium">{label}:</span>}
            <span className="text-sm font-mono">00:00</span>
        </div>
    )
}
