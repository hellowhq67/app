export const dynamic = 'force-dynamic';

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight, Clock, PenTool } from "lucide-react";
import { getPteQuestionCounts } from "@/lib/db/queries/metrics";

const writingTypes = [
  {
    id: "summarize_written_text",
    name: "Summarize Written Text",
    description: "Read a passage and write a one-sentence summary (5-75 words)",
    time: "10 min",
    aiScored: true,
  },
  {
    id: "write_essay",
    name: "Write Essay",
    description: "Write an essay of 200-300 words on a given topic",
    time: "20 min",
    aiScored: true,
  },
];

export default async function WritingPracticePage() {
  const counts = await getPteQuestionCounts();

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-green-100 dark:bg-green-950">
            <PenTool className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Writing Practice
            </h1>
            <p className="text-muted-foreground">
              Master both writing question types for PTE Academic
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
        <span className="text-foreground font-medium">Writing</span>
      </nav>

      {/* Question Types */}
      <div className="grid gap-4">
        {writingTypes.map((type) => (
          <Link key={type.id} href={`/academic/practice/writing/${type.id}`}>
            <Card className="hover:shadow-md transition-all cursor-pointer hover:border-primary/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{type.name}</h3>
                      {type.aiScored && (
                        <Badge variant="secondary" className="text-xs">
                          AI Scored
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
