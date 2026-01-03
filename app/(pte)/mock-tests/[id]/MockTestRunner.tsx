"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Clock, Target, CheckCircle } from "lucide-react";
import { submitMockAnswer, completeMockTest } from "@/lib/actions/mock-test";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Define the shape of data passed from the server page
interface MockTestRunnerProps {
    test: any; // pteMockTests
    questions: any[]; // Joined pteMockTestQuestions + pteQuestions
    existingAttempts: any[]; // pteAttempts
}

export default function MockTestRunner({ test, questions, existingAttempts }: MockTestRunnerProps) {
    const router = useRouter();

    // Find the first uncompleted question index or default to 0
    const initialIndex = test.currentQuestionIndex || 0;

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(initialIndex);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [testComplete, setTestComplete] = useState(test.status === 'completed');

    // Current question data
    const currentQuestionWrapper = questions[currentQuestionIndex];
    const currentQuestion = currentQuestionWrapper?.question;
    const currentMockQuestionId = currentQuestionWrapper?.id; // pte_mock_test_questions ID

    // Check if current question has an existing attempt
    const existingAttempt = existingAttempts.find(
        (a) => a.questionId === currentQuestion?.id
    );

    const [answerText, setAnswerText] = useState(existingAttempt?.responseText || "");
    const [timeTaken, setTimeTaken] = useState(0);

    useEffect(() => {
        // Reset state when question changes if no existing attempt
        if (!existingAttempt) {
            setAnswerText("");
            setTimeTaken(0);
        } else {
            setAnswerText(existingAttempt.responseText || "");
        }
    }, [currentQuestionIndex, existingAttempt]);

    // Timer for current question
    useEffect(() => {
        if (testComplete || existingAttempt) return;

        const interval = setInterval(() => {
            setTimeTaken((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [currentQuestionIndex, testComplete, existingAttempt]);

    const handleNext = async () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        } else {
            // End of test
            await handleFinishTest();
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1);
        }
    };

    const handleSubmitAnswer = async () => {
        if (!currentQuestionWrapper || isSubmitting) return;

        setIsSubmitting(true);
        try {
            // Mock audio url for now until we integrate the real recorder component fully
            const audioUrl = null;

            const result = await submitMockAnswer({
                testId: test.id,
                questionId: currentQuestion.id,
                answerText: answerText,
                audioUrl: audioUrl, // Pass undefined/null for text-only questions
                durationSeconds: timeTaken,
                mockQuestionId: currentMockQuestionId
            });

            if (result.success) {
                toast.success("Answer saved");
                // Move to next question automatically? Or let user click next?
                // Usually better to stay or move. Let's move for flow.
                handleNext();
            } else {
                toast.error(result.error || "Failed to save answer");
            }
        } catch (error) {
            toast.error("Error submitting answer");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFinishTest = async () => {
        setIsSubmitting(true);
        try {
            const result = await completeMockTest(test.id);
            if (result.success) {
                toast.success("Test completed!");
                setTestComplete(true);
                router.push('/pte/mock-tests'); // Redirect to dashboard/history
            } else {
                toast.error("Failed to complete test");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error finishing test");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!currentQuestion) {
        return <div>Loading question data...</div>;
    }

    const content = currentQuestion.content as any;
    // We need to properly type guard or cast 'content' based of question type in a real app
    // For now assuming a generic structure or handling basic text fields

    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
        <div className="container max-w-4xl mx-auto py-8 space-y-8">
            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{test.testName}</h1>
                        <p className="text-muted-foreground">
                            Question {currentQuestionIndex + 1} of {questions.length}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm font-mono bg-muted px-3 py-1 rounded-md">
                            <Clock className="h-4 w-4" />
                            {Math.floor(timeTaken / 60)}:{(timeTaken % 60).toString().padStart(2, '0')}
                        </div>
                        <Button variant="destructive" onClick={handleFinishTest}>Finish Test</Button>
                    </div>
                </div>
                <Progress value={progress} className="h-2" />
            </div>

            {/* Question Card */}
            <Card className="min-h-[400px]">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <Badge variant="outline" className="mb-2">
                                {currentQuestionWrapper.questionOrder}. {currentQuestion.title}
                            </Badge>
                            <CardTitle className="text-xl">
                                {content.text || content.prompt || "Question Prompt"}
                            </CardTitle>
                        </div>
                        <Badge>{currentQuestion.difficulty}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Instruction */}
                    <div className="bg-muted p-4 rounded-lg text-sm">
                        <strong>Instruction:</strong> {currentQuestion.instruction}
                    </div>

                    {/* Content Display (Audio, Image, etc) */}
                    {/* For now, just a placeholder for complex types. Real implementation needs specific renderers */}
                    {content.audioUrl && (
                        <div className="p-4 border rounded-md">
                            <p className="text-sm font-medium mb-2">Audio Clip:</p>
                            <audio controls src={content.audioUrl} className="w-full" />
                        </div>
                    )}

                    {/* Answer Input Area - Simplified for MVP to Text Area */}
                    {/* In reality, we need different inputs for Speaking (Recorder) vs Writing (Text) */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Your Answer</label>
                        <textarea
                            className="w-full min-h-[150px] p-3 border rounded-md resize-y bg-background"
                            placeholder="Type your answer here..."
                            value={answerText}
                            onChange={(e) => setAnswerText(e.target.value)}
                            disabled={!!existingAttempt}
                        />
                        {existingAttempt && (
                            <p className="text-xs text-muted-foreground italic flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" /> Answer previously submitted
                            </p>
                        )}
                    </div>

                </CardContent>
            </Card>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between pt-4">
                <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                >
                    <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                </Button>

                <div className="flex gap-2">
                    {!existingAttempt && (
                        <Button onClick={handleSubmitAnswer} disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Submit Answer"}
                        </Button>
                    )}
                    <Button onClick={handleNext} variant={existingAttempt ? "default" : "secondary"}>
                        {currentQuestionIndex === questions.length - 1 ? "Review & Finish" : "Next"} <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
