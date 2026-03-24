export const dynamic = 'force-dynamic';

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight, Clock, Headphones } from "lucide-react";

const listeningTypes = [
  {
    id: "summarize_spoken_text",
    name: "Summarize Spoken Text",
    description: "Listen to a recording and write a summary in 50-70 words",
    time: "10 min",
    aiScored: true,
    questionCount: 45,
  },
  {
    id: "multiple_choice_multiple",
    name: "Multiple Choice (Multiple)",
    description: "Listen to a recording and answer multiple-choice question",
    time: "40-90 sec",
    aiScored: false,
    questionCount: 40,
  },
  {
    id: "fill_blanks",
    name: "Fill in the Blanks",
    description:
      "Listen to a recording and type the missing words in transcript",
    time: "30-60 sec",
    aiScored: false,
    questionCount: 35,
  },
  {
    id: "highlight_correct_summary",
    name: "Highlight Correct Summary",
    description: "Select the paragraph that best summarizes the recording",
    time: "30-90 sec",
    aiScored: false,
    questionCount: 25,
  },
  {
    id: "multiple_choice_single",
    name: "Multiple Choice (Single)",
    description: "Listen to a recording and answer single-choice question",
    time: "30-60 sec",
    aiScored: false,
    questionCount: 30,
  },
  {
    id: "select_missing_word",
    name: "Select Missing Word",
    description: "Select the missing word that completes the recording",
    time: "20-70 sec",
    aiScored: false,
    questionCount: 25,
  },
  {
    id: "highlight_incorrect_words",
    name: "Highlight Incorrect Words",
    description: "Click on the words in the transcript that differ from audio",
    time: "15-50 sec",
    aiScored: false,
    questionCount: 35,
  },
  {
    id: "write_from_dictation",
    name: "Write From Dictation",
    description: "Type the short sentence exactly as you hear it",
    time: "10-15 sec",
    aiScored: true,
    questionCount: 150, // High value task
    isHighValue: true,
  },
];

import { getPteQuestionCounts } from "@/lib/db/queries/metrics";

export default async function ListeningPracticePage() {
  const counts = await getPteQuestionCounts();
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-950">
            <Headphones className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Listening Practice
            </h1>
            <p className="text-muted-foreground">
              Master all 8 listening question types for PTE Academic
            </p>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/academic/practice" className="hover:text-primary">
          Practice
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Listening</span>
      </nav>

      {/* Question Types */}
      <div className="grid gap-4">
        {listeningTypes.map((type) => (
          <Link key={type.id} href={`/academic/practice/listening/${type.id}`}>
            <Card
              className={`hover:shadow-md transition-all cursor-pointer hover:border-primary/50 ${
                type.isHighValue
                  ? "border-orange-200 dark:border-orange-900 bg-orange-50/30 dark:bg-orange-950/20"
                  : ""
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{type.name}</h3>
                      {type.aiScored ? (
                        <Badge variant="secondary" className="text-xs">
                          AI Scored
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Auto Scored
                        </Badge>
                      )}
                      {type.name === "Write From Dictation" && (
                        <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 hover:bg-orange-200 border-0 text-xs">
                          High Value
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm mb-2">
                      {type.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {type.time}
                      </span>
                      <span>{counts[type.id] || 0} questions available</span>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
