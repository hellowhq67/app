'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';

interface ScoreData {
    overallScore: number;
    grammarScore?: number;
    vocabularyScore?: number;
    coherenceScore?: number;
    pronunciationScore?: number;
    fluencyScore?: number;
    contentScore: number;
    feedback: string;
    suggestions: string[];
}

interface ScoreDialogProps {
    isOpen: boolean;
    onClose: () => void;
    scoreData: ScoreData | null;
    type: 'writing' | 'speaking';
}

export function ScoreDialog({ isOpen, onClose, scoreData, type }: ScoreDialogProps) {
    if (!scoreData) return null;

    const getScoreColor = (score: number) => {
        if (score >= 79) return 'text-green-600';
        if (score >= 65) return 'text-blue-600';
        if (score >= 50) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <TrendingUp className="h-6 w-6 text-primary" />
                        AI Performance Analysis
                    </DialogTitle>
                    <DialogDescription>
                        Comprehensive breakdown of your PTE {type} performance.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Overall Score */}
                    <div className="flex flex-col items-center justify-center p-6 bg-secondary/20 rounded-xl border border-secondary">
                        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Overall PTE Score</span>
                        <span className={`text-6xl font-bold ${getScoreColor(scoreData.overallScore)}`}>
                            {scoreData.overallScore}
                        </span>
                        <span className="text-sm text-muted-foreground mt-1">out of 90</span>
                    </div>

                    {/* Detailed Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {type === 'writing' ? (
                            <>
                                <ScoreMetric label="Grammar" score={scoreData.grammarScore || 0} />
                                <ScoreMetric label="Vocabulary" score={scoreData.vocabularyScore || 0} />
                                <ScoreMetric label="Coherence" score={scoreData.coherenceScore || 0} />
                                <ScoreMetric label="Content" score={scoreData.contentScore} />
                            </>
                        ) : (
                            <>
                                <ScoreMetric label="Pronunciation" score={scoreData.pronunciationScore || 0} />
                                <ScoreMetric label="Fluency" score={scoreData.fluencyScore || 0} />
                                <ScoreMetric label="Content" score={scoreData.contentScore} />
                            </>
                        )}
                    </div>

                    {/* AI Feedback */}
                    <div className="space-y-3">
                        <h3 className="font-semibold flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            AI Feedback
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed bg-muted p-4 rounded-lg">
                            {scoreData.feedback}
                        </p>
                    </div>

                    {/* Suggestions */}
                    <div className="space-y-3">
                        <h3 className="font-semibold flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-amber-500" />
                            Suggestions for Improvement
                        </h3>
                        <ul className="grid gap-2">
                            {scoreData.suggestions.map((suggestion, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <Badge variant="outline" className="mt-0.5 shrink-0 px-1.5 h-5 min-w-5 flex items-center justify-center">
                                        {index + 1}
                                    </Badge>
                                    {suggestion}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function ScoreMetric({ label, score }: { label: string; score: number }) {
    return (
        <Card>
            <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-sm font-bold">{score}/90</span>
                </div>
                <Progress value={(score / 90) * 100} className="h-2" />
            </CardContent>
        </Card>
    );
}
