import React from 'react'

export default function AudioPlayer({ audioUrl, onPlay }: { audioUrl: string, onPlay?: () => void }) {
    return (
        <div className="border p-2 rounded">
            <audio
                controls
                src={audioUrl}
                onPlay={onPlay}
                className="w-full"
            />
        </div>
    )
}
