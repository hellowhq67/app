export const dynamic = 'force-dynamic';

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight, Clock, Mic, Sparkles } from "lucide-react";
import { getPteQuestionCounts } from "@/lib/db/queries/metrics";

const speakingTypes = [
  {
    id: "read_aloud",
    name: "Read Aloud",
    description: "Read a text aloud with correct pronunciation and fluency",
    time: "30-35 sec",
    aiScored: true,
    isHighValue: true,
  },
  {
    id: "repeat_sentence",
    name: "Repeat Sentence",
    description: "Listen and repeat the sentence exactly as you hear it",
    time: "15 sec",
    aiScored: true,
    isHighValue: true,
  },
  {
    id: "describe_image",
    name: "Describe Image",
    description: "Describe what you see in the image in detail",
    time: "40 sec",
    aiScored: true,
  },
  {
    id: "retell_lecture",
    name: "Re-tell Lecture",
    description: "Listen to a lecture and retell it in your own words",
    time: "40 sec",
    aiScored: true,
  },
  {
    id: "answer_short_question",
    name: "Answer Short Question",
    description: "Answer a question with a single word or short phrase",
    time: "10 sec",
    aiScored: true,
  },
  {
    id: "respond_to_situation",
    name: "Respond to a Situation",
    description: "Respond appropriately to a given situation (Core)",
    time: "40 sec",
    aiScored: true,
    isCore: true,
  },
  {
    id: "summarize_group_discussion",
    name: "Summarize Group Discussion",
    description: "Listen to a discussion and summarize main points (Core)",
    time: "40 sec",
    aiScored: true,
    isCore: true,
  },
];

export default async function SpeakingPracticePage() {
  const counts = await getPteQuestionCounts();

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-950">
            <Mic className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Speaking Practice
            </h1>
            <p className="text-muted-foreground">
              Master all 7 speaking question types with real-time AI feedback
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
        <span className="text-foreground font-medium">Speaking</span>
      </nav>

      {/* Question Types */}
      <div className="grid gap-4">
        {speakingTypes.map((type) => (
          <Link key={type.id} href={`/academic/practice/speaking/${type.id}`}>
            <Card
              className={`hover:shadow-md transition-all cursor-pointer hover:border-primary/50 group ${
                type.isHighValue
                  ? "border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-950/20"
                  : ""
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                        {type.name}
                      </h3>
                      {type.aiScored && (
                        <Badge variant="secondary" className="text-xs">
                          AI Scored
                        </Badge>
                      )}
                      {type.isHighValue && (
                        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 hover:bg-blue-200 border-0 text-xs gap-1">
                          <Sparkles className="size-3" /> High Value
                        </Badge>
                      )}
                      {type.isCore && (
                        <Badge
                          variant="outline"
                          className="text-xs border-gray-300 text-gray-500"
                        >
                          Core
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm mb-2 max-w-xl">
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
                  <div className="size-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
