import { notFound, redirect } from "next/navigation";
import { getMockTest } from "@/lib/actions/mock-test";
import MockTestRunner from "./MockTestRunner";

interface MockTestIdPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MockTestIdPage({ params }: MockTestIdPageProps) {
  const { id } = await params;
  const result = await getMockTest(id);

  if (!result.success || !result.data) {
    if (result.error === "Test not found") {
      notFound();
    }
    redirect("/pte/mock-tests");
  }

  const { test, questions, attempts } = result.data;

  return (
    <MockTestRunner
      test={test}
      questions={questions}
      existingAttempts={attempts}
    />
  );
}
