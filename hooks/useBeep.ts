
import { useCallback, useRef } from 'react';

export function useBeep() {
    const audioContextRef = useRef<AudioContext | null>(null);

    const playBeep = useCallback(() => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }

            const ctx = audioContextRef.current;
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, ctx.currentTime);
            gainNode.gain.setValueAtTime(0.1, ctx.currentTime);

            oscillator.start();
            oscillator.stop(ctx.currentTime + 0.3); // 300ms beep
        } catch (error) {
            console.error("Failed to play beep:", error);
        }
    }, []);

    return { playBeep };
}
