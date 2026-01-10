"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PenTool } from "lucide-react";
import { QuestionType, AIFeedbackData } from "@/lib/types";
import { scoreWritingAttempt } from "@/app/actions/pte";
import { CountdownTimer } from "@/components/pte/timers/CountdownTimer";
import { FeedbackCard } from "@/components/pte/feedback/FeedbackCard";

interface WritingPracticeClientProps {
    questionId: string;
    questionType: string | QuestionType;
    content: string;
    timeLimit?: number;
}

export function WritingPracticeClient({
    questionId,
    questionType,
    content,
    timeLimit = 600, // Default 10 mins
}: WritingPracticeClientProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<AIFeedbackData | null>(null);
    const [textAnswer, setTextAnswer] = useState("");
    const [wordCount, setWordCount] = useState(0);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        setTextAnswer(text);
        setWordCount(text.trim().split(/\s+/).filter(Boolean).length);
    };

    const handleSubmit = async () => {
        if (!textAnswer.trim()) {
            toast({
                title: "Empty Answer",
                description: "Please write your answer before submitting.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        setFeedback(null);

        try {
            const result = await scoreWritingAttempt(
                content,
                textAnswer,
                wordCount,
                questionId
            );

            if (result.success && result.feedback) {
                setFeedback(result.feedback);
                toast({
                    title: "Scoring Complete",
                    description: `Your score: ${result.feedback.overallScore}/90`,
                });
            } else {
                throw new Error(result.error || "Scoring failed");
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Timer & Info */}
            <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                    <PenTool className="h-5 w-5 text-primary" />
                    <span className="font-medium">Word Count: {wordCount}</span>
                </div>
                <CountdownTimer
                    initialSeconds={timeLimit}
                    onComplete={() => {
                        toast({
                            title: "Time's up!",
                            description: "Submitting your answer automatically.",
                        });
                        handleSubmit();
                    }}
                />
            </div>

            {/* Input Area */}
            <Card>
                <CardContent className="p-6">
                    <Textarea
                        value={textAnswer}
                        onChange={handleTextChange}
                        placeholder="Type your response here..."
                        className="min-h-[300px] text-lg leading-relaxed resize-y"
                    />
                </CardContent>
                <CardFooter className="justify-between border-t bg-muted/10 p-4">
                    <p className="text-sm text-muted-foreground">
                        {questionType === 'summarize_written_text'
                            ? "Summarize the text in one sentence (5-75 words)."
                            : "Write an essay of 200-300 words."}
                    </p>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !textAnswer.trim()}
                        size="lg"
                        className="min-w-[150px]"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Scoring...
                            </>
                        ) : (
                            "Submit Answer"
                        )}
                    </Button>
                </CardFooter>
            </Card>

            {/* Feedback Display */}
            {feedback && (
                <FeedbackCard
                    feedback={feedback}
                    questionType={questionType}
                    onRetry={() => {
                        setFeedback(null);
                        setTextAnswer("");
                        setWordCount(0);
                    }}
                />
            )}
        </div>
    );
}
