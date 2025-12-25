'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Mic, MicOff, Phone, PhoneOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface GeminiRealtimeAgentProps {
    className?: string
}

interface ConversationTurn {
    role: 'user' | 'model'
    text?: string
    toolCall?: any
    toolResponse?: any
}

export function GeminiRealtimeAgent({ className }: GeminiRealtimeAgentProps) {
    const [isConnected, setIsConnected] = useState(false)
    const [isConnecting, setIsConnecting] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [turns, setTurns] = useState<ConversationTurn[]>([])

    const wsRef = useRef<WebSocket | null>(null)
    const audioContextRef = useRef<AudioContext | null>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const processorRef = useRef<ScriptProcessorNode | null>(null)
    const audioQueueRef = useRef<Int16Array[]>([])
    const isPlayingRef = useRef(false)

    const connect = async () => {
        try {
            setIsConnecting(true)
            setError(null)

            const response = await fetch('/api/gemini/session', { method: 'POST' })
            if (!response.ok) throw new Error('Failed to start session')

            const { apiKey, config } = await response.json()

            const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BiDiGenerateContent?key=${apiKey}`
            const ws = new WebSocket(url)
            wsRef.current = ws

            ws.onopen = () => {
                console.log('Connected to Gemini Multimodal Live')
                setIsConnected(true)
                setIsConnecting(false)

                // Send Setup Message
                ws.send(JSON.stringify({
                    setup: {
                        model: config.model,
                        generation_config: config.generationConfig,
                        system_instruction: config.systemInstruction,
                        tools: [{
                            function_declarations: [
                                {
                                    name: 'getUserStudyStats',
                                    description: 'Get the user\'s overall study statistics, profile, and recent test attempts.',
                                    parameters: { type: 'OBJECT', properties: {} }
                                },
                                {
                                    name: 'searchPracticeQuestions',
                                    description: 'Search for PTE practice questions by section, type, or keywords.',
                                    parameters: {
                                        type: 'OBJECT',
                                        properties: {
                                            section: { type: 'STRING', description: 'Section: speaking, writing, reading, listening' },
                                            type: { type: 'STRING', description: 'Question type code (e.g. s_read_aloud)' },
                                            query: { type: 'STRING', description: 'Keywords to search in question text' }
                                        }
                                    }
                                },
                                {
                                    name: 'updateStudyGoals',
                                    description: 'Update the user\'s target score or study goals.',
                                    parameters: {
                                        type: 'OBJECT',
                                        properties: {
                                            targetScore: { type: 'NUMBER' },
                                            studyGoal: { type: 'STRING' },
                                            examDate: { type: 'STRING', description: 'ISO date string' }
                                        }
                                    }
                                },
                                {
                                    name: 'getUserWeakAreas',
                                    description: 'Analyze recent test performance to identify weak areas.',
                                    parameters: { type: 'OBJECT', properties: {} }
                                }
                            ]
                        }]
                    }
                }))

                setupAudioCapture(ws)
            }

            ws.onmessage = async (event) => {
                const data = JSON.parse(event.data)
                handleGeminiMessage(data)
            }

            ws.onerror = (e) => {
                console.error('WS Error:', e)
                setError('Connection error')
            }

            ws.onclose = () => {
                console.log('Gemini connection closed')
                cleanup()
            }

        } catch (err) {
            console.error('Connection failed:', err)
            setError(err instanceof Error ? err.message : 'Connection failed')
            setIsConnecting(false)
        }
    }

    const setupAudioCapture = async (ws: WebSocket) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            streamRef.current = stream

            const audioContext = new AudioContext({ sampleRate: 16000 })
            audioContextRef.current = audioContext

            const source = audioContext.createMediaStreamSource(stream)
            const processor = audioContext.createScriptProcessor(2048, 1, 1)
            processorRef.current = processor

            processor.onaudioprocess = (e) => {
                if (isMuted || ws.readyState !== WebSocket.OPEN) return

                const inputData = e.inputBuffer.getChannelData(0)
                const pcm16 = new Int16Array(inputData.length)
                for (let i = 0; i < inputData.length; i++) {
                    const s = Math.max(-1, Math.min(1, inputData[i]))
                    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff
                }

                ws.send(JSON.stringify({
                    realtime_input: {
                        media_chunks: [{
                            data: arrayBufferToBase64(pcm16.buffer),
                            mime_type: 'audio/pcm;rate=16000'
                        }]
                    }
                }))
            }

            source.connect(processor)
            processor.connect(audioContext.destination)
        } catch (err) {
            console.error('Audio setup failed:', err)
            setError('Microphone access denied')
        }
    }

    const handleGeminiMessage = async (message: any) => {
        if (message.server_content?.model_turn) {
            const parts = message.server_content.model_turn.parts
            for (const part of parts) {
                if (part.inline_data) {
                    queueAudioResponse(part.inline_data.data)
                }
                if (part.text) {
                    setTurns(prev => [...prev, { role: 'model', text: part.text }])
                }
            }
        }

        if (message.tool_call) {
            for (const call of message.tool_call.function_calls) {
                setTurns(prev => [...prev, { role: 'model', toolCall: call }])
                const result = await executeTool(call.name, call.args)

                wsRef.current?.send(JSON.stringify({
                    tool_response: {
                        function_responses: [{
                            name: call.name,
                            id: call.id,
                            response: { result }
                        }]
                    }
                }))
                setTurns(prev => [...prev, { role: 'model', toolResponse: result }])
            }
        }
    }

    const executeTool = async (toolName: string, args: any) => {
        try {
            const res = await fetch('/api/gemini/tools', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ toolName, args })
            })
            return await res.json()
        } catch (err) {
            console.error('Tool execution failed:', err)
            return { error: 'Failed to execute tool' }
        }
    }

    const queueAudioResponse = (base64Data: string) => {
        const binary = atob(base64Data)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
        const pcm16 = new Int16Array(bytes.buffer)
        audioQueueRef.current.push(pcm16)
        if (!isPlayingRef.current) playNextChunk()
    }

    const playNextChunk = () => {
        if (audioQueueRef.current.length === 0) {
            isPlayingRef.current = false
            return
        }

        isPlayingRef.current = true
        const chunk = audioQueueRef.current.shift()!
        const audioContext = audioContextRef.current || new AudioContext({ sampleRate: 24000 })
        if (!audioContextRef.current) audioContextRef.current = audioContext

        const buffer = audioContext.createBuffer(1, chunk.length, 24000)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < chunk.length; i++) data[i] = chunk[i] / 32768

        const source = audioContext.createBufferSource()
        source.buffer = buffer
        source.connect(audioContext.destination)
        source.onended = playNextChunk
        source.start()
    }

    const disconnect = () => {
        if (wsRef.current) wsRef.current.close()
        cleanup()
    }

    const cleanup = () => {
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
        if (audioContextRef.current) audioContextRef.current.close()
        if (processorRef.current) processorRef.current.disconnect()
        wsRef.current = null
        setIsConnected(false)
        setTurns([])
    }

    const toggleMute = () => setIsMuted(!isMuted)

    function arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer)
        let binary = ''
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
        return btoa(binary)
    }

    useEffect(() => cleanup, [])

    return (
        <div className={cn('flex flex-col items-center gap-6 p-6', className)}>
            <div className="relative group">
                <div className={cn(
                    "absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200",
                    isConnected && "opacity-75 animate-pulse"
                )} />
                <Button
                    onClick={isConnected ? disconnect : connect}
                    disabled={isConnecting}
                    size="default"
                    variant={isConnected ? 'destructive' : 'default'}
                    className="relative rounded-full flex items-center justify-center shadow-2xl"
                >
                    {isConnecting ? (
                        <Loader2 className="h-10 w-10 animate-spin" />
                    ) : isConnected ? (
                        <PhoneOff className="h-10 w-10" />
                    ) : (
                        <Phone className="h-10 w-10" />
                    )}
                </Button>
            </div>

            <div className="flex flex-col items-center gap-2">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-zinc-100 dark:to-zinc-400">
                    {isConnected ? 'Connected to Gemini' : 'Gemini Voice Assistant'}
                </h2>
                <p className="text-zinc-500 text-sm">
                    {isConnected ? 'Speak naturally to manage your PTE journey' : 'Tap to start a conversation'}
                </p>
            </div>

            {isConnected && (
                <div className="flex items-center gap-4">
                    <Button
                        onClick={toggleMute}
                        size="lg"
                        variant={isMuted ? 'outline' : 'secondary'}
                        className="rounded-full h-14 w-14 shrink-0"
                    >
                        {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                    </Button>
                </div>
            )}

            {error && <div className="text-sm font-medium text-red-500 animate-bounce">{error}</div>}

            <div className="w-full max-w-lg space-y-4 overflow-y-auto max-h-[300px] scrollbar-hide">
                {turns.map((turn, i) => (
                    <div key={i} className={cn(
                        "p-3 rounded-2xl text-sm transition-all duration-300",
                        turn.role === 'model' ? "bg-zinc-100 dark:bg-zinc-800 self-start" : "bg-blue-600 text-white self-end",
                        turn.toolCall && "border border-amber-500 bg-amber-50 dark:bg-amber-900/20",
                        turn.toolResponse && "border border-green-500 bg-green-50 dark:bg-green-900/20"
                    )}>
                        {turn.text && <p className="leading-relaxed">{turn.text}</p>}
                        {turn.toolCall && (
                            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span>Calling {turn.toolCall.name}...</span>
                            </div>
                        )}
                        {turn.toolResponse && (
                            <div className="text-green-600 dark:text-green-400 font-mono text-xs">
                                Done.
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
