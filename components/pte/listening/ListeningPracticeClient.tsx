"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Play, Pause, Volume2, Ear } from "lucide-react";
import { QuestionType, AIFeedbackData } from "@/lib/types";
import { scoreListeningAttempt } from "@/app/actions/pte";
import { CountdownTimer } from "@/components/pte/timers/CountdownTimer";
import { FeedbackCard } from "@/components/pte/feedback/FeedbackCard";
import { ListeningFillBlanks } from "./ListeningFillBlanks";
import { HighlightIncorrectWords } from "./HighlightIncorrectWords";

interface ListeningPracticeClientProps {
  questionId: string;
  questionType: string | QuestionType;
  content: string;
  audioUrl?: string;
  transcript?: string; // For Highlight Incorrect Words
  options?: string[]; // For MCQs
  timeLimit?: number;
}

export function ListeningPracticeClient({
  questionId,
  questionType,
  content,
  audioUrl,
  transcript,
  options = [],
  timeLimit = 600, // Default 10 mins usually
}: ListeningPracticeClientProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<AIFeedbackData | null>(null);

  // Audio State
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Answer States
  const [textAnswer, setTextAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [filledBlanks, setFilledBlanks] = useState<Record<string, string>>({});
  const [highlightedWords, setHighlightedWords] = useState<number[]>([]);

  // Handle Audio Events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setFeedback(null);

    try {
      // Prepare submission data
      const userResponse = {
        text: textAnswer,
        selectedOption,
        selectedOptions,
        filledBlanks,
        highlightedWords,
      };

      // Server Action
      // Expected: type, questionText, questionId, options, wordBank, audioTranscript, answerKey, userResponse
      const result = await scoreListeningAttempt(
        questionType as any,
        content,
        questionId,
        options,
        undefined, // wordBank placeholder
        transcript,
        null, // answerKey placeholder - usually hidden
        userResponse
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

  // Per-type instruction text
  const getInstruction = () => {
    switch (questionType) {
      case QuestionType.SUMMARIZE_SPOKEN_TEXT:
      case "summarize_spoken_text":
        return "Listen to the recording and write a summary in 50–70 words.";
      case QuestionType.WRITE_FROM_DICTATION:
      case "write_from_dictation":
        return "Listen carefully and type the sentence you hear exactly as spoken.";
      case QuestionType.LISTENING_MULTIPLE_CHOICE_SINGLE:
      case "listening_mc_single":
      case "multiple_choice_single":
        return "Listen to the recording and choose the best answer from the options below.";
      case QuestionType.HIGHLIGHT_CORRECT_SUMMARY:
      case "highlight_correct_summary":
        return "Listen to the recording and select the paragraph that best summarises it.";
      case QuestionType.SELECT_MISSING_WORD:
      case "select_missing_word":
        return "Listen to the recording and select the word that completes the sentence.";
      case QuestionType.LISTENING_MULTIPLE_CHOICE_MULTIPLE:
      case "listening_mc_multiple":
      case "multiple_choice_multiple":
        return "Listen to the recording and choose all options that apply.";
      case QuestionType.LISTENING_BLANKS:
      case "fill_blanks":
        return "Listen to the recording and type the missing words into the gaps.";
      case QuestionType.HIGHLIGHT_INCORRECT_WORDS:
      case "highlight_incorrect_words":
        return "Click on the words in the text that differ from what you hear in the recording.";
      default:
        return null;
    }
  };

  // Render Input Area based on Type
  const renderInputArea = () => {
    const instruction = getInstruction();

    switch (questionType) {
      case QuestionType.SUMMARIZE_SPOKEN_TEXT:
      case "summarize_spoken_text":
      case QuestionType.WRITE_FROM_DICTATION:
      case "write_from_dictation":
        return (
          <div className="space-y-4">
            {instruction && (
              <p className="text-sm text-muted-foreground border-l-4 border-primary/40 pl-3 py-1 bg-muted/30 rounded-r">
                {instruction}
              </p>
            )}
            <Label>Your Answer:</Label>
            <Textarea
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              placeholder="Type your response here..."
              className="min-h-[200px]"
            />
            <div className="text-xs text-muted-foreground text-right">
              Word count: {textAnswer.split(/\s+/).filter(Boolean).length}
            </div>
          </div>
        );

      case QuestionType.LISTENING_MULTIPLE_CHOICE_SINGLE:
      case "listening_mc_single":
      case "multiple_choice_single":
      case QuestionType.HIGHLIGHT_CORRECT_SUMMARY:
      case "highlight_correct_summary":
      case QuestionType.SELECT_MISSING_WORD:
      case "select_missing_word":
        return (
          <div className="space-y-4">
            {instruction && (
              <p className="text-sm text-muted-foreground border-l-4 border-primary/40 pl-3 py-1 bg-muted/30 rounded-r">
                {instruction}
              </p>
            )}
            <RadioGroup
              value={selectedOption}
              onValueChange={setSelectedOption}
              className="space-y-3"
            >
              {options.map((opt, idx) => (
                <div
                  key={idx}
                  className="flex items-start space-x-2 border p-4 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <RadioGroupItem value={opt} id={`opt-${idx}`} className="mt-1" />
                  <Label htmlFor={`opt-${idx}`} className="cursor-pointer flex-1">
                    {opt}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case QuestionType.LISTENING_MULTIPLE_CHOICE_MULTIPLE:
      case "listening_mc_multiple":
      case "multiple_choice_multiple":
        return (
          <div className="space-y-4">
            {instruction && (
              <p className="text-sm text-muted-foreground border-l-4 border-primary/40 pl-3 py-1 bg-muted/30 rounded-r">
                {instruction}
              </p>
            )}
            <div className="space-y-3">
              {options.map((opt, idx) => (
                <div
                  key={idx}
                  className="flex items-start space-x-2 border p-4 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Checkbox
                    id={`opt-${idx}`}
                    className="mt-1"
                    checked={selectedOptions.includes(opt)}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      if (e.target.checked) {
                        setSelectedOptions([...selectedOptions, opt]);
                      } else {
                        setSelectedOptions(
                          selectedOptions.filter((o) => o !== opt)
                        );
                      }
                    }}
                  />
                  <Label htmlFor={`opt-${idx}`} className="cursor-pointer flex-1">
                    {opt}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );

      case QuestionType.LISTENING_BLANKS:
      case "fill_blanks":
        return (
          <div className="space-y-4">
            {instruction && (
              <p className="text-sm text-muted-foreground border-l-4 border-primary/40 pl-3 py-1 bg-muted/30 rounded-r">
                {instruction}
              </p>
            )}
            <ListeningFillBlanks
              transcript={content}
              value={filledBlanks}
              onChange={setFilledBlanks}
            />
          </div>
        );

      case QuestionType.HIGHLIGHT_INCORRECT_WORDS:
      case "highlight_incorrect_words":
        return (
          <div className="space-y-4">
            {instruction && (
              <p className="text-sm text-muted-foreground border-l-4 border-primary/40 pl-3 py-1 bg-muted/30 rounded-r">
                {instruction}
              </p>
            )}
            <HighlightIncorrectWords
              transcript={transcript ?? content}
              value={highlightedWords}
              onChange={setHighlightedWords}
            />
          </div>
        );

      default:
        return (
          <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
            <p className="text-sm">This question type is not yet supported.</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Audio Player */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePlay}
          className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white"
        >
          {isPlaying ? (
            <Pause className="fill-current" />
          ) : (
            <Play className="fill-current ml-1" />
          )}
        </Button>

        <div className="flex-1 space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Audio Prompt</span>
            <span>{isPlaying ? "Playing..." : "Ready"}</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Volume2 className="text-slate-400" />

        <audio ref={audioRef} src={audioUrl} className="hidden" />
      </div>

      {/* Input Area */}
      <Card>
        <CardContent className="p-6">{renderInputArea()}</CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg">
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Ear className="w-4 h-4" />
          Listen closely and answer carefully.
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

      <div className="flex justify-end items-center">

        <Button
          onClick={handleSubmit}
          disabled={
            isSubmitting ||
            (!textAnswer &&
             !selectedOption &&
             selectedOptions.length === 0 &&
             Object.keys(filledBlanks).length === 0 &&
             highlightedWords.length === 0)
          }
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
      </div>

      {/* Feedback Display */}
      {feedback && (
        <FeedbackCard
          feedback={feedback}
          questionType={questionType}
          onRetry={() => {
            setFeedback(null);
            setTextAnswer("");
            setSelectedOption("");
            setSelectedOptions([]);
            setFilledBlanks({});
            setHighlightedWords([]);
            // Reset audio
            if (audioRef.current) {
              audioRef.current.currentTime = 0;
              setProgress(0);
            }
          }}
        />
      )}
    </div>
  );
}
