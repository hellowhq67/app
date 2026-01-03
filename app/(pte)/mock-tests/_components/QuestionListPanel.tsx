import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, Circle, ChevronRight } from "lucide-react";
import { MockTestType } from "@/data/mockTestQuestions";

interface QuestionListPanelProps {
  testType: MockTestType;
  questions: any[];
  currentQuestionIndex: number;
  completedQuestions: Set<string>;
  onSelectQuestion: (index: number) => void;
  onClose: () => void;
}

export function QuestionListPanel({
  testType,
  questions,
  currentQuestionIndex,
  completedQuestions,
  onSelectQuestion,
  onClose,
}: QuestionListPanelProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="font-semibold">Questions</h3>
        <p className="text-sm text-muted-foreground">
          {completedQuestions.size} of {questions.length} completed
        </p>
      </div>

      {/* Question List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {questions.map((question, index) => {
            const isCompleted = completedQuestions.has(question.id);
            const isCurrent = index === currentQuestionIndex;

            return (
              <Button
                key={question.id}
                variant={isCurrent ? "default" : "ghost"}
                className={`w-full justify-start h-auto p-3 ${
                  isCurrent ? "bg-primary text-primary-foreground" : ""
                }`}
                onClick={() => onSelectQuestion(index)}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium truncate">
                      {question.question || `Question ${index + 1}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {question.type}
                    </p>
                  </div>
                  {isCurrent && (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </Button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t">
        <Button variant="outline" className="w-full" onClick={onClose}>
          Close Panel
        </Button>
      </div>
    </div>
  );
}
