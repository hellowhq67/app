'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

interface VoiceAssistantContextType {
    isOpen: boolean
    open: () => void
    close: () => void
    toggle: () => void
}

const VoiceAssistantContext = createContext<VoiceAssistantContextType | undefined>(undefined)

export function VoiceAssistantProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)

    const open = useCallback(() => setIsOpen(true), [])
    const close = useCallback(() => setIsOpen(false), [])
    const toggle = useCallback(() => setIsOpen((prev) => !prev), [])

    return (
        <VoiceAssistantContext.Provider value={{ isOpen, open, close, toggle }}>
            {children}
        </VoiceAssistantContext.Provider>
    )
}

export function useVoiceAssistant() {
    const context = useContext(VoiceAssistantContext)
    if (context === undefined) {
        throw new Error('useVoiceAssistant must be used within a VoiceAssistantProvider')
    }
    return context
}
