import React, { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function SpeakingRecorder({
    type,
    timers,
    onRecorded,
    auto,
    onStateChange,
}: any) {
    // Mock recording logic for build pass
    const handleMockRecord = () => {
        onStateChange?.('recording')
        setTimeout(() => {
            onStateChange?.('idle')
            // Mock blob
            const blob = new Blob(['mock audio'], { type: 'audio/webm' })
            onRecorded({ blob, durationMs: 5000, timings: {} })
        }, 1000)
    }

    return (
        <div className="border p-4 rounded-md text-center">
            <p className="text-sm text-muted-foreground mb-2">Recorder Placeholder</p>
            <Button onClick={handleMockRecord} variant="secondary">
                Simulate Recording
            </Button>
        </div>
    )
}
