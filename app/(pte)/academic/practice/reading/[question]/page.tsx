import { db } from "@/lib/db/drizzle";
import { pteQuestionTypes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import QuestionListTable from "@/components/pte/practice/QuestionListTable";
import { getPracticeQuestions } from "@/lib/pte/practice";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    question: string;
  }>;
}

export default async function ReadingQuestionListPage({ params }: PageProps) {
  const { question: questionTypeCode } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // 1. Get the Question Type ID
  const questionType = await db.query.pteQuestionTypes.findFirst({
    where: eq(pteQuestionTypes.code, questionTypeCode as any),
  });

  if (!questionType) {
    return notFound();
  }

  // 2. Get Questions for this type using helper
  const questions = await getPracticeQuestions(
    questionTypeCode,
    1,
    100, // Fetch all for list
    session?.user?.id
  );

  return (
    <QuestionListTable
      questionType={questionType}
      questions={questions}
      basePath={`/academic/practice/reading/${questionTypeCode}`}
      backLink="/academic/practice/reading"
      title="Back to Reading Practice"
    />
  );
}
