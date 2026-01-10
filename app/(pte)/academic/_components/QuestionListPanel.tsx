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
      <ScrollArea className="flex-1 bg-white dark:bg-zinc-950">
        <div className="divide-y divide-gray-100 dark:divide-white/5">
          {filteredQuestions.map((question, filteredIndex) => {
            const originalIndex = getOriginalIndex(question);
            const isActive = originalIndex === currentQuestionIndex;
            const isCompleted = completedQuestions.has(question.id);
            const isBookmarked = bookmarkedQuestions.has(question.id);
            // Use question ID from data or fallback to index
            const questionDisplayId = `#${question.id.substring(0, 4) || String(originalIndex + 1).padStart(4, '0')}`;

            return (
              <Link
                key={question.id}
                href={`/academic/practice/${section}/${testType}/${question.id}`}
                onClick={() => {
                  if (onClose) onClose();
                  if (onSelectQuestion) onSelectQuestion(originalIndex);
                }}
                className={cn(
                  "group flex items-center justify-between p-4 transition-all hover:bg-gray-50 dark:hover:bg-white/5",
                  isActive && "bg-blue-50/50 dark:bg-blue-900/10"
                )}
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">#{question.id.substring(0, 4)}</span>
                      <h4 className={cn(
                        "text-sm font-medium truncate",
                        isActive ? "text-primary" : "text-gray-700 dark:text-gray-200"
                      )}>
                        {(question as QuestionWithTitle).title || `Question ${originalIndex + 1}`}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-gray-100 text-gray-500 rounded-sm px-1.5 py-0 text-[10px] font-normal"
                      >
                        #{question.id.substring(0, 4)}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-sm px-1.5 py-0 text-[10px] font-normal border",
                          question.difficulty === 'hard' ? "border-red-200 text-red-600 bg-red-50" :
                            question.difficulty === 'medium' ? "border-amber-200 text-amber-600 bg-amber-50" :
                              "border-emerald-200 text-emerald-600 bg-emerald-50"
                        )}
                      >
                        {question.difficulty || 'Medium'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-7 text-xs px-3 rounded-md",
                      isCompleted
                        ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-200 text-gray-500 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-400"
                    )}
                  >
                    {isCompleted ? "Done" : "Undone"}
                  </Button>
                  <button
                    onClick={(e) => toggleBookmark(question.id, e)}
                    className={cn(
                      "text-gray-300 hover:text-amber-400 transition-colors",
                      isBookmarked && "text-amber-400"
                    )}
                  >
                    <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
                  </button>
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
