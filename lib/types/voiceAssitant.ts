export interface VoiceAssistantContextType {
    isOpen: boolean
    open: () => void
    close: () => void
    toggle: () => void
}

export interface AIVoiceAssistantProps {
    className?: string
}
