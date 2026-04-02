import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle2, XCircle, RotateCcw, ArrowRight } from "lucide-react"
import { AIFeedbackData } from '@/lib/types'

interface ReadingScoreModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    feedback: AIFeedbackData | null
    onRetry: () => void
    onNext?: () => void
}

export function ReadingScoreModal({
    isOpen,
    onOpenChange,
    feedback,
    onRetry,
    onNext
}: ReadingScoreModalProps) {
    if (!feedback) return null

    // Use percentage-based threshold when maxScore is available (deterministic scoring),
    // otherwise fall back to absolute threshold for AI-scored questions (scale ~0-90).
    const scorePercent = feedback.maxScore && feedback.maxScore > 0
        ? (feedback.overallScore / feedback.maxScore) * 100
        : feedback.overallScore  // AI scores are already on a larger scale

    const isGoodScore = scorePercent >= 50

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        {isGoodScore ? (
                            <CheckCircle2 className="h-8 w-8 text-green-500" />
                        ) : (
                            <XCircle className="h-8 w-8 text-red-500" />
                        )}
                        <DialogTitle className="text-2xl">Result</DialogTitle>
                    </div>
                    <DialogDescription className="text-base">
                        You scored <span className="font-bold text-foreground">{feedback.overallScore}</span> points.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] pr-4">
                    <div className="space-y-6">
                        {/* Explanation / Analysis */}
                        {feedback.suggestions && feedback.suggestions.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider">Analysis</h4>
                                <ul className="space-y-2">
                                    {feedback.suggestions.map((suggestion, idx) => (
                                        <li key={idx} className="text-sm bg-muted/50 p-3 rounded-md border">
                                            {suggestion}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Correct/Incorrect breakdown if available in feedback structure 
                            (Assuming feedback might contain detailed breakdown later)
                        */}
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30">
                                <span className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase">Strengths</span>
                                <p className="text-sm mt-1 text-green-800 dark:text-green-300">
                                    {feedback.strengths?.length 
                                        ? feedback.strengths.join(". ") 
                                        : "Good effort!"}
                                </p>
                            </div>
                            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30">
                                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase">Improvements</span>
                                <p className="text-sm mt-1 text-amber-800 dark:text-amber-300">
                                    {feedback.areasForImprovement?.length 
                                        ? feedback.areasForImprovement.join(". ") 
                                        : "Keep practicing."}
                                </p>
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <DialogFooter className="flex flex-row sm:justify-between gap-2 mt-4">
                    <Button variant="outline" onClick={onRetry} className="flex-1 sm:flex-none">
                        <RotateCcw className="mr-2 h-4 w-4" /> Retry
                    </Button>
                    {onNext && (
                        <Button onClick={onNext} className="flex-1 sm:flex-none">
                            Next Question <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                    {!onNext && (
                         <Button onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none">
                            Close
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
