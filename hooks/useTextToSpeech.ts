import { useState, useEffect, useCallback, useRef } from "react";

interface UseTextToSpeechReturn {
    speak: (text: string) => void;
    stop: () => void;
    isSpeaking: boolean;
    isSupported: boolean;
    error: string | null;
}

export function useTextToSpeech(): UseTextToSpeechReturn {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const synth = useRef<SpeechSynthesis | null>(null);
    const utterance = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            synth.current = window.speechSynthesis;
            setIsSupported(true);
        } else {
            setError("Text-to-speech is not supported in this browser.");
        }

        return () => {
            if (synth.current && isSpeaking) {
                synth.current.cancel();
            }
        };
    }, []);

    const speak = useCallback((text: string) => {
        if (!synth.current || !text) return;

        // Cancel any ongoing speech
        synth.current.cancel();

        const newUtterance = new SpeechSynthesisUtterance(text);
        utterance.current = newUtterance;

        // Configure voice (prefer native English female voice if available)
        const voices = synth.current.getVoices();
        const preferredVoice = voices.find(
            (voice) =>
                voice.lang.startsWith("en") &&
                (voice.name.includes("Google") || voice.name.includes("Premium") || voice.name.includes("Female"))
        );

        if (preferredVoice) {
            newUtterance.voice = preferredVoice;
        }

        newUtterance.onstart = () => setIsSpeaking(true);
        newUtterance.onend = () => setIsSpeaking(false);
        newUtterance.onerror = (event) => {
            console.error("TTS Error:", event);
            setIsSpeaking(false);
            setError("An error occurred during text-to-speech playback.");
        };

        synth.current.speak(newUtterance);
    }, []);

    const stop = useCallback(() => {
        if (synth.current) {
            synth.current.cancel();
            setIsSpeaking(false);
        }
    }, []);

    return {
        speak,
        stop,
        isSpeaking,
        isSupported,
        error,
    };
}
