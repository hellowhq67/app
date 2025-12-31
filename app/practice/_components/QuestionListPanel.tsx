import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Bookmark, ChevronDown, CheckCircle2, Circle, X, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SpeakingQuestion, TestType, getTestTypeInfo } from "@/data/speakingQuestions";
import { WritingQuestion, WritingTestType, getWritingTestTypeInfo } from "@/data/writingQuestions";
import { ReadingQuestion, ReadingTestType, getReadingTestTypeInfo } from "@/data/readingQuestions";
import { ListeningQuestion, ListeningTestType, getListeningTestTypeInfo } from "@/data/listeningQuestions";

type SectionType = "speaking" | "writing" | "reading" | "listening";
type AllTestTypes = TestType | WritingTestType | ReadingTestType | ListeningTestType;
type AllQuestions = SpeakingQuestion | WritingQuestion | ReadingQuestion | ListeningQuestion;

// Helper type to ensure title access
type QuestionWithTitle = AllQuestions & { title?: string };

interface QuestionListPanelProps {
  section: SectionType;
  testType: AllTestTypes;
  questions: AllQuestions[];
  currentQuestionIndex: number; // Can be -1 if not found
  completedQuestions?: Set<string>;
  onSelectQuestion?: (index: number) => void;
  onClose?: () => void;
}

export function QuestionListPanel({
  section,
  testType,
  questions,
  currentQuestionIndex,
  completedQuestions = new Set(),
  onSelectQuestion,
  onClose,
}: QuestionListPanelProps) {
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "practiced" | "not-practiced">("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [bookmarkFilter, setBookmarkFilter] = useState<"all" | "bookmarked">("all");
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<string>>(new Set());

  const getTypeInfo = () => {
    switch (section) {
      case "speaking": return getTestTypeInfo(testType as TestType);
      case "writing": return getWritingTestTypeInfo(testType as WritingTestType);
      case "reading": return getReadingTestTypeInfo(testType as ReadingTestType);
      case "listening": return getListeningTestTypeInfo(testType as ListeningTestType);
    }
  };
  const typeInfo = getTypeInfo();

  const filteredQuestions = questions.filter((q, index) => {
    const qWithTitle = q as QuestionWithTitle;

    // Search filter
    const matchesSearch = search === "" ||
      `#${String(index + 1).padStart(8, '0')}`.includes(search) ||
      (qWithTitle.title && qWithTitle.title.toLowerCase().includes(search.toLowerCase())) ||
      `Question ${index + 1}`.toLowerCase().includes(search.toLowerCase());

    // Practice status filter
    const isPracticed = completedQuestions.has(q.id);
    const matchesPracticeStatus =
      filterTab === "all" ||
      (filterTab === "practiced" && isPracticed) ||
      (filterTab === "not-practiced" && !isPracticed);

    // Level/difficulty filter
    const matchesLevel = levelFilter === "all" || q.difficulty === levelFilter;

    // Bookmark filter
    const matchesBookmark = bookmarkFilter === "all" || bookmarkedQuestions.has(q.id);

    return matchesSearch && matchesPracticeStatus && matchesLevel && matchesBookmark;
  });

  const toggleBookmark = (questionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarkedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800";
      case "medium":
        return "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800";
      case "hard":
        return "bg-red-500/10 text-red-600 border-red-200 dark:border-red-800";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getOriginalIndex = (question: AllQuestions) => {
    return questions.findIndex(q => q.id === question.id);
  };

  // Helper to generate deterministic numbers from string ID
  const getDeterministicNumber = (id: string, min: number, max: number) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const range = max - min;
    return Math.abs(hash % range) + min;
  };

  return (
    <Card className="h-full flex flex-col bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-l shadow-2xl overflow-hidden rounded-none sm:rounded-l-xl">
      {/* Header */}
      <div className="p-4 border-b space-y-4 bg-gradient-to-b from-muted/50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-inner ring-1 ring-primary/20">
              <span className="text-lg font-bold text-primary">
                {typeInfo.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="font-semibold text-lg leading-tight tracking-tight">{typeInfo.name}</h2>
              <p className="text-xs text-muted-foreground font-medium">{questions.length} Questions Available</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Search & Tabs Combined */}
        <div className="space-y-3">
          <div className="relative group">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search by ID or content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background/50 focus:bg-background transition-all border-muted-foreground/20 focus:border-primary/50 shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <Button
              variant={filterTab === "all" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilterTab("all")}
              className={cn("h-7 text-xs rounded-full px-3", filterTab === "all" && "bg-primary/10 text-primary hover:bg-primary/20")}
            >
              All
            </Button>
            <Button
              variant={filterTab === "practiced" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilterTab("practiced")}
              className={cn("h-7 text-xs rounded-full px-3", filterTab === "practiced" && "bg-primary/10 text-primary hover:bg-primary/20")}
            >
              Practiced
            </Button>
            <Button
              variant={filterTab === "not-practiced" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilterTab("not-practiced")}
              className={cn("h-7 text-xs rounded-full px-3", filterTab === "not-practiced" && "bg-primary/10 text-primary hover:bg-primary/20")}
            >
              New
            </Button>

            <div className="ml-auto pl-2 border-l flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-muted">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setLevelFilter("all")}>All Levels</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLevelFilter("easy")}>Easy</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLevelFilter("medium")}>Medium</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLevelFilter("hard")}>Hard</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setBookmarkFilter(bookmarkFilter === "all" ? "bookmarked" : "all")}>
                    {bookmarkFilter === "all" ? "Show Bookmarked Only" : "Show All Questions"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Question List */}
      <ScrollArea className="flex-1 bg-muted/5">
        <div className="divide-y divide-border/40">
          {filteredQuestions.map((question, filteredIndex) => {
            const originalIndex = getOriginalIndex(question);
            const isActive = originalIndex === currentQuestionIndex;
            const isCompleted = completedQuestions.has(question.id);
            const isBookmarked = bookmarkedQuestions.has(question.id);
            const questionNumber = `#${String(originalIndex + 18000201).toString()}`;
            const qWithTitle = question as QuestionWithTitle;

            // Deterministic fake data
            const viewedCount = getDeterministicNumber(question.id, 50, 500);
            const appearedCount = getDeterministicNumber(question.id + "appeared", 5, 50);

            return (
              <Link
                key={question.id}
                href={`/practice/${section}/${question.id}`}
                onClick={() => {
                  if (onClose) onClose();
                  if (onSelectQuestion) onSelectQuestion(originalIndex);
                }}
                className={cn(
                  "group flex items-start gap-4 p-4 transition-all hover:bg-background hover:shadow-sm relative border-l-4 border-l-transparent",
                  isActive && "bg-background shadow-md border-l-primary z-10"
                )}
              >
                {/* Status Indicator */}
                <div className="mt-1 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shadow-sm rounded-full" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground/30" />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn(
                      "text-[10px] font-mono font-medium tracking-wider uppercase",
                      isActive ? "text-primary" : "text-muted-foreground/70"
                    )}>
                      {questionNumber}
                    </span>
                    <button
                      onClick={(e) => toggleBookmark(question.id, e)}
                      className={cn(
                        "opacity-0 group-hover:opacity-100 transition-all p-1 -mr-2 rounded-full hover:bg-muted",
                        isBookmarked && "opacity-100 text-amber-500"
                      )}
                    >
                      <Bookmark className={cn("h-3.5 w-3.5", isBookmarked && "fill-current")} />
                    </button>
                  </div>

                  <p className={cn(
                    "text-sm font-medium leading-snug line-clamp-2 transition-colors",
                    isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground/80"
                  )}>
                    {qWithTitle.title || `Question ${originalIndex + 1}`}
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[10px] px-1.5 py-0 h-5 border font-normal uppercase tracking-wider",
                        getDifficultyColor(question.difficulty)
                      )}
                    >
                      {question.difficulty}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                      <BarChart2 className="h-3 w-3" />
                      Appeared {appearedCount} | Viewed {viewedCount}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer Pro Tip */}
      <div className="p-3 bg-gradient-to-r from-primary/5 via-primary/5 to-transparent border-t backdrop-blur-sm">
        <p className="text-xs text-primary/80 text-center font-medium">
          🎯 Pro Tip: Practice daily to improve your {typeInfo.name} score.
        </p>
      </div>
    </Card>
  );
}
