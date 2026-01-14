import { ScoreResult } from "@/lib/scoring";
import { CheckCircle, AlertCircle, Lightbulb, X, Share2, Play, Pause, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useRef, useEffect } from "react";
import { WordMarking } from "@/lib/types";

interface ScoreDisplayProps {
  score: ScoreResult;
  spokenText?: string;
  originalText?: string;
  audioUrl?: string;
  wordMarking?: WordMarking[];
  onClose?: () => void;
  isModal?: boolean;
}

interface WordAnalysis {
  word: string;
  status: "good" | "average" | "poor" | "pause" | "omitted" | "inserted";
}

// Score bar component for visual feedback
const ScoreBar = ({ label, score, maxScore = 90, color }: { label: string; score: number; maxScore?: number; color: string }) => {
  const percentage = Math.min((score / maxScore) * 100, 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className={color}>{score}<span className="text-muted-foreground">/{maxScore}</span></span>
      </div>
      <div className="h-2.5 bg-muted/50 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${percentage >= 70 ? 'bg-emerald-500' : percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'
            }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Circular score indicator
const CircularScore = ({ score, maxScore = 90 }: { score: number; maxScore?: number }) => {
  const percentage = Math.min((score / maxScore) * 100, 100);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const color = percentage >= 70 ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-28 h-28 mx-auto">
      <svg className="transform -rotate-90" width="112" height="112">
        <circle cx="56" cy="56" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
        <circle
          cx="56" cy="56" r="45" fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          strokeLinecap="round" className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color }}>{score}</span>
        <span className="text-xs text-muted-foreground">/ {maxScore}</span>
      </div>
    </div>
  );
};

export function ScoreDisplay({
  score,
  spokenText = "",
  originalText = "",
  audioUrl,
  wordMarking,
  onClose,
  isModal = false
}: ScoreDisplayProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeTab, setActiveTab] = useState<"pronunciation" | "stress">("pronunciation");
  const audioRef = useRef<HTMLAudioElement>(null);

  const getScoreColor = (s: number) => {
    if (s >= 65) return "text-emerald-500";
    if (s >= 50) return "text-amber-500";
    return "text-red-500";
  };

  // Generate word analysis (Server Priority or Client Fallback)
  const getWordAnalysis = (): WordAnalysis[] => {
    if (wordMarking && wordMarking.length > 0) {
      return wordMarking.map(wm => ({
        word: wm.word,
        status: wm.classification as any
      }));
    }

    if (!spokenText) return [];

    const spokenWords = spokenText.split(/\s+/).filter(Boolean);
    const originalWords = originalText ? originalText.toLowerCase().split(/\s+/).filter(Boolean) : [];

    return spokenWords.map((word) => {
      const cleanWord = word.toLowerCase().replace(/[.,!?;:'"]/g, "");

      if (originalWords.includes(cleanWord)) {
        return { word, status: "good" as const };
      }

      if (["um", "uh", "er", "ah", "like", "you know"].includes(cleanWord)) {
        return { word, status: "poor" as const };
      }

      const hasPartialMatch = originalWords.some(orig =>
        orig.includes(cleanWord) || cleanWord.includes(orig) ||
        (orig.length > 3 && cleanWord.length > 3 &&
          (orig.slice(0, 3) === cleanWord.slice(0, 3)))
      );

      if (hasPartialMatch) {
        return { word, status: "average" as const };
      }

      if (score.pronunciation >= 70) {
        return { word, status: "good" as const };
      } else if (score.pronunciation >= 50) {
        return { word, status: "average" as const };
      }
      return { word, status: "poor" as const };
    });
  };

  const wordAnalysis = getWordAnalysis();

  const getWordColor = (status: string) => {
    switch (status) {
      case "good": return "text-blue-500"; // APEUni uses blue for good
      case "average": return "text-amber-500";
      case "poor": return "text-red-500";
      case "omitted": return "text-gray-400 line-through decoration-red-500";
      case "inserted": return "text-purple-500";
      case "pause": return "text-muted-foreground";
      default: return "text-foreground";
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  const getSuggestion = (component: string, scoreValue: number) => {
    if (component === "Content") {
      if (scoreValue >= 70) return "Content well captured with main meaning preserved.";
      if (scoreValue >= 50) return "Minor omissions; main meaning preserved.";
      return "Significant content gaps; key information missing.";
    }
    if (component === "Pronunciation") {
      if (scoreValue >= 70) return "Clear and intelligible with natural speech.";
      if (scoreValue >= 50) return "Some mis-articulations but understandable.";
      return "Frequent pronunciation errors.";
    }
    if (component === "Fluency") {
      if (scoreValue >= 70) return "Smooth delivery with natural pacing.";
      if (scoreValue >= 50) return "Some hesitations; uneven pacing.";
      return "Frequent pauses affecting communication.";
    }
    return "";
  };

  const scoreContent = (
    <div className="space-y-6 animate-score-reveal">
      {/* Header with Overall Score */}
      <div className="flex items-start gap-6 p-4 bg-gradient-to-r from-muted/50 to-transparent rounded-xl">
        <CircularScore score={score.overallScore} maxScore={90} />
        <div className="flex-1 space-y-3">
          <div className="text-sm text-muted-foreground">Score Breakdown</div>
          <ScoreBar label="Content" score={score.content} color={getScoreColor(score.content)} />
          <ScoreBar label="Pronunciation" score={score.pronunciation} color={getScoreColor(score.pronunciation)} />
          <ScoreBar label="Fluency" score={score.fluency} color={getScoreColor(score.fluency)} />
        </div>
      </div>

      {/* Skills Analysis */}
      <div className="grid grid-cols-3 gap-3 text-center text-sm">
        <div className="p-3 rounded-lg bg-muted/30">
          <div className={`text-2xl font-bold ${getScoreColor(score.pronunciation)}`}>{score.pronunciation}</div>
          <div className="text-muted-foreground">Pronunciation</div>
        </div>
        <div className="p-3 rounded-lg bg-muted/30">
          <div className={`text-2xl font-bold ${getScoreColor(score.fluency)}`}>{score.fluency}</div>
          <div className="text-muted-foreground">Oral Fluency</div>
        </div>
        <div className="p-3 rounded-lg bg-muted/30">
          <div className={`text-2xl font-bold ${getScoreColor(score.content)}`}>{score.content}</div>
          <div className="text-muted-foreground">Reading</div>
        </div>
      </div>

      {/* Audio Player */}
      {audioUrl && (
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>

          <span className="text-sm text-muted-foreground min-w-[100px]">
            {formatTime(currentTime)} / {formatTime(duration || 0)}
          </span>

          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-foreground transition-all duration-100"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>

          <Volume2 className="h-4 w-4 text-muted-foreground" />

          <audio ref={audioRef} src={audioUrl} className="hidden" />
        </div>
      )}

      {/* Word-by-Word Analysis with Tabs */}
      {wordAnalysis.length > 0 && (
        <div className="border rounded-lg bg-card overflow-hidden">
          <Tabs defaultValue="pronunciation" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-muted/30 h-auto p-0">
              <TabsTrigger 
                value="pronunciation" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Pronunciation Accuracy
              </TabsTrigger>
              <TabsTrigger 
                value="stress"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Stress
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pronunciation" className="p-4 space-y-4 mt-0">
              {/* Legend */}
              <div className="flex items-center gap-6 text-sm">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  Good
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  Average
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  Bad
                </span>
              </div>

              {/* Word Analysis Display */}
              <div className="p-4 bg-muted/20 rounded-lg border">
                <p className="leading-relaxed text-lg tracking-wide">
                  {wordAnalysis.map((item, i) => (
                    <span key={i}>
                      <span
                        className={`${getWordColor(item.status)} cursor-pointer hover:bg-muted/50 px-0.5 rounded transition-all`}
                        title={`${item.status.charAt(0).toUpperCase() + item.status.slice(1)} pronunciation`}
                      >
                        {item.word}
                      </span>
                      {item.status === "pause" ? " / " : " "}
                    </span>
                  ))}
                </p>
              </div>

              <p className="text-sm text-muted-foreground text-center flex items-center justify-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                Hover over words to see pronunciation feedback
              </p>
            </TabsContent>

            <TabsContent value="stress" className="p-4 space-y-4 mt-0">
              {/* Stress Analysis - Simplified view */}
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">Stress analysis requires advanced audio processing.</p>
                <p className="text-xs mt-2">Coming soon with syllable-level stress patterns.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Detailed Analysis Sections */}
      <div className="space-y-3">
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-2 text-emerald-500 font-medium">
            <CheckCircle className="h-4 w-4" /> Strengths
          </div>
          <ul className="space-y-1 text-foreground text-sm">
            {score.detailedAnalysis.strengths.map((s, i) => <li key={i}>• {s}</li>)}
          </ul>
        </div>

        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-2 text-amber-500 font-medium">
            <AlertCircle className="h-4 w-4" /> Areas to Improve
          </div>
          <ul className="space-y-1 text-foreground text-sm">
            {score.detailedAnalysis.improvements.map((s, i) => <li key={i}>• {s}</li>)}
          </ul>
        </div>

        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex items-center gap-2 mb-2 text-primary font-medium">
            <Lightbulb className="h-4 w-4" /> Tips
          </div>
          <ul className="space-y-1 text-foreground text-sm">
            {score.detailedAnalysis.tips.map((s, i) => <li key={i}>• {s}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <Dialog open onOpenChange={() => onClose?.()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Score Details</DialogTitle>
          </DialogHeader>

          {scoreContent}

          <div className="flex justify-between mt-6 pt-4 border-t">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button className="bg-teal-500 hover:bg-teal-600 text-white">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return scoreContent;
}