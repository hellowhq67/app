"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface PracticeContextType {
    // Add state properties here as needed
    currentQuestionId?: string
    setCurrentQuestionId: (id: string | undefined) => void
}

const PracticeContext = createContext<PracticeContextType | undefined>(undefined)

export function PracticeProvider({ children }: { children: ReactNode }) {
    const [currentQuestionId, setCurrentQuestionId] = useState<string | undefined>(undefined)

    return (
        <PracticeContext.Provider value={{ currentQuestionId, setCurrentQuestionId }}>
            {children}
        </PracticeContext.Provider>
    )
}

export function usePractice() {
    const context = useContext(PracticeContext)
    if (context === undefined) {
        throw new Error('usePractice must be used within a PracticeProvider')
    }
    return context
}
