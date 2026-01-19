import { useState, useRef, useCallback, useEffect } from "react";

// Speech Recognition Interfaces
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onresult:
    | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any)
    | null;
    onerror:
    | ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any)
    | null;
}

interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

type SpeechRecognitionResultList = {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
};

type SpeechRecognitionResult = {
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
    isFinal: boolean;
};

type SpeechRecognitionAlternative = {
    transcript: string;
    confidence: number;
};

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
}

declare global {
    interface Window {
        SpeechRecognition: {
            new(): SpeechRecognition;
        };
        webkitSpeechRecognition: {
            new(): SpeechRecognition;
        };
    }
}

export interface TranscriptionSegment {
    text: string;
    startSecond: number;
    endSecond: number;
}

interface UseSpeechRecorderOptions {
    lang?: string;
    onTranscriptUpdate?: (text: string) => void;
    onSegmentUpdate?: (segments: TranscriptionSegment[]) => void;
}

interface UseSpeechRecorderReturn {
    isRecording: boolean;
    isProcessing: boolean;
    supportsSpeechRecognition: boolean;
    transcript: string;
    segments: TranscriptionSegment[];
    audioBlob: Blob | null;
    startRecording: () => Promise<void>;
    stopRecording: () => void;
    error: string | null;
}

export function useSpeechRecorder({
    lang = "en-US",
    onTranscriptUpdate,
    onSegmentUpdate,
}: UseSpeechRecorderOptions = {}): UseSpeechRecorderReturn {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [supportsSpeechRecognition, setSupportsSpeechRecognition] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [segments, setSegments] = useState<TranscriptionSegment[]>([]);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [error, setError] = useState<string | null>(null);

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const recordingStartTimeRef = useRef<number>(0);
    const lastSegmentEndRef = useRef<number>(0);

    // Detect Speech Recognition capability on mount
    useEffect(() => {
        if (
            typeof window !== "undefined" &&
            ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
        ) {
            setSupportsSpeechRecognition(true);

            const SpeechRecognition =
                window.SpeechRecognition || window.webkitSpeechRecognition;
            const speechRecognition = new SpeechRecognition();
            speechRecognition.continuous = true;
            speechRecognition.interimResults = true;
            speechRecognition.lang = lang;

            speechRecognition.onresult = (event) => {
                let finalTranscript = "";
                const currentTime = (Date.now() - recordingStartTimeRef.current) / 1000;

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const result = event.results[i];
                    if (result.isFinal) {
                        const text = result[0]?.transcript ?? "";
                        finalTranscript += text;

                        // Create a segment for this final result
                        const newSegment: TranscriptionSegment = {
                            text: text.trim(),
                            startSecond: lastSegmentEndRef.current,
                            endSecond: currentTime,
                        };

                        if (newSegment.text) {
                            setSegments((prev: TranscriptionSegment[]) => {
                                const updated = [...prev, newSegment];
                                onSegmentUpdate?.(updated);
                                return updated;
                            });
                            lastSegmentEndRef.current = currentTime;
                        }
                    }
                }

                if (finalTranscript) {
                    setTranscript((prev: string) => {
                        const updated = prev + finalTranscript;
                        onTranscriptUpdate?.(updated);
                        return updated;
                    });
                }
            };

            speechRecognition.onerror = (event) => {
                console.error("Speech Recognition Error:", event.error);
                // Don't stop recording just because SR failed
            };

            recognitionRef.current = speechRecognition;
        }
    }, [lang, onTranscriptUpdate, onSegmentUpdate]);

    const startRecording = useCallback(async () => {
        try {
            setError(null);
            setTranscript("");
            setSegments([]);
            setAudioBlob(null);
            audioChunksRef.current = [];
            recordingStartTimeRef.current = Date.now();
            lastSegmentEndRef.current = 0;

            // 1. Start MediaRecorder (Critical)
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                // Stop tracks
                if (streamRef.current) {
                    for (const track of streamRef.current.getTracks()) {
                        track.stop();
                    }
                    streamRef.current = null;
                }

                // Create blob
                const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                setAudioBlob(blob);
            };

            mediaRecorder.onerror = (e) => {
                console.error("MediaRecorder Error", e);
                setError("Recording failed");
                setIsRecording(false);
            };

            mediaRecorder.start();

            // 2. Start Speech Recognition (Optional)
            if (supportsSpeechRecognition && recognitionRef.current) {
                try {
                    recognitionRef.current.start();
                } catch (e) {
                    console.warn("Failed to start Speech Recognition", e);
                }
            }

            setIsRecording(true);
        } catch (err) {
            console.error("Failed to start recording:", err);
            setError("Could not access microphone. Please grant permission.");
        }
    }, [supportsSpeechRecognition]);

    const stopRecording = useCallback(() => {
        setIsRecording(false);
        setIsProcessing(true);

        // Stop Speech Recognition
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) {
                /* ignore */
            }
        }

        // Stop MediaRecorder
        if (
            mediaRecorderRef.current &&
            mediaRecorderRef.current.state === "recording"
        ) {
            mediaRecorderRef.current.stop();
        }

        setTimeout(() => setIsProcessing(false), 500);
    }, []);

    return {
        isRecording,
        isProcessing,
        supportsSpeechRecognition,
        transcript,
        segments,
        audioBlob,
        startRecording,
        stopRecording,
        error,
    };
}
