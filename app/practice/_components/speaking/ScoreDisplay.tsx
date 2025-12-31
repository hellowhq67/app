import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    X, Check, AlertCircle, Play, Pause,
    BarChart2, Type, Award, Activity
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScoreResult, getScoreGrade } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

interface ScoreDisplayProps {
    score: ScoreResult;
    spokenText: string;
    originalText?: string;
    audioUrl?: string;
    isModal?: boolean;
    onClose?: () => void;
}

export function ScoreDisplay({
    score,
    spokenText,
    originalText,
    audioUrl,
    isModal = false,
    onClose
}: ScoreDisplayProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const togglePlayback = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleEnded = () => setIsPlaying(false);
        audio.addEventListener('ended', handleEnded);
        return () => audio.removeEventListener('ended', handleEnded);
    }, []);

    const grade = getScoreGrade(score.overall);

    const Content = (
        <div className="space-y-6">
            {!isModal && (
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        Performance Result
                    </h3>
                    <Badge variant="outline" className={cn("text-lg px-3 py-1", grade.color)}>
                        {grade.grade}
                    </Badge>
                </div>
            )}

            {/* Main Score */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ScoreCard
                    label="Overall"
                    value={score.overall}
                    icon={<Award className="h-4 w-4" />}
                    colorClassName={grade.color}
                    highlight
                />
                <ScoreCard
                    label="Pronunciation"
                    value={score.pronunciation || 0}
                    icon={<Activity className="h-4 w-4" />}
                    colorClassName="text-blue-600"
                />
                <ScoreCard
                    label="Fluency"
                    value={score.fluency || 0}
                    icon={<Activity className="h-4 w-4" />}
                    colorClassName="text-purple-600"
                />
                <ScoreCard
                    label="Content"
                    value={score.content || 0}
                    icon={<BarChart2 className="h-4 w-4" />}
                    colorClassName="text-emerald-600"
                />
            </div>

            {/* Audio Player if URL exists */}
            {audioUrl && (
                <Card className="p-3 flex items-center gap-3 bg-muted/50">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={togglePlayback}
                    >
                        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </Button>
                    <div className="flex-1">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary animate-pulse w-full origin-left transform scale-x-0 transition-transform duration-1000" />
                        </div>
                    </div>
                    <audio ref={audioRef} src={audioUrl} className="hidden" />
                </Card>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                {/* Comparison View */}
                <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2 text-muted-foreground">
                        <Type className="h-4 w-4" /> Transcript Analysis
                    </h4>
                    <ScrollArea className="h-[200px] w-full rounded-md border p-4 bg-muted/30">
                        <div className="space-y-4">
                            {originalText && (
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Original</p>
                                    <p className="text-sm leading-relaxed text-foreground/90">{originalText}</p>
                                </div>
                            )}
                            {originalText && <Separator />}
                            <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Your Speech</p>
                                <div className="text-sm leading-relaxed">
                                    {spokenText ? (
                                        compareText(originalText || "", spokenText)
                                    ) : (
                                        <span className="text-muted-foreground italic">No speech detected</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </div>

                {/* Detailed Feedback */}
                <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2 text-muted-foreground">
                        <AlertCircle className="h-4 w-4" /> AI Feedback
                    </h4>
                    <Card className="p-4 h-[200px] bg-muted/30 border-dashed">
                        <ScrollArea className="h-full pr-4">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {score.feedback || "No specific feedback available for this attempt."}
                            </p>

                            {score.breakdown && Object.keys(score.breakdown).length > 0 && (
                                <div className="mt-4 space-y-3">
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Detailed Metrics</p>
                                    {Object.entries(score.breakdown).map(([key, value]) => (
                                        <div key={key} className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span className="capitalize">{key}</span>
                                                <span className="font-medium">{value}/90</span>
                                            </div>
                                            <Progress value={value} max={90} className="h-1.5" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </Card>
                </div>
            </div>

            {isModal && (
                <div className="flex justify-end pt-4">
                    <Button onClick={onClose}>Close Results</Button>
                </div>
            )}
        </div>
    );

    if (isModal) {
        return (
            <Dialog open={true} onOpenChange={() => onClose?.()}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-orange-500" />
                            Speaking Test Results
                        </DialogTitle>
                    </DialogHeader>
                    {Content}
                </DialogContent>
            </Dialog>
        );
    }

    return Content;
}

function ScoreCard({
    label,
    value,
    icon,
    colorClassName,
    highlight = false
}: {
    label: string;
    value: number;
    icon: React.ReactNode;
    colorClassName?: string;
    highlight?: boolean;
}) {
    return (
        <Card className={cn(
            "p-4 flex flex-col items-center justify-center text-center gap-2 transition-all hover:scale-105",
            highlight ? "bg-primary/5 border-primary/20" : "bg-card"
        )}>
            <div className={cn("p-2 rounded-full bg-background shadow-sm", colorClassName)}>
                {icon}
            </div>
            <div>
                <div className={cn("text-2xl font-bold", colorClassName)}>
                    {value}
                </div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    {label}
                </div>
            </div>
        </Card>
    );
}

// Simple diff helper
function compareText(original: string, spoken: string) {
    if (!original) return <span className="text-foreground">{spoken}</span>;

    const originalWords = original.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").split(/\s+/);
    const spokenWords = spoken.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").split(/\s+/);

    // This is a very naive diff visualization
    return (
        <span className="text-foreground">
            {spoken.split(/\s+/).map((word, i) => {
                const cleanWord = word.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
                const isMatch = originalWords.includes(cleanWord);
                return (
                    <span
                        key={i}
                        className={cn(
                            "inline-block mr-1",
                            isMatch ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400 decoration-wavy underline"
                        )}
                    >
                        {word}
                    </span>
                );
            })}
        </span>
    );
}
