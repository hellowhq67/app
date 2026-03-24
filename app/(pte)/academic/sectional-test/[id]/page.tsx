export const dynamic = 'force-dynamic';

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { pteSectionalTests, pteSectionalAttempts, pteQuestions } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import SectionalTestRunner from "@/components/pte/sectional-test/SectionalTestRunner";
import { routes } from "@/lib/config/navigation";

export default async function SectionalTestPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
        redirect('/sign-in');
    }

    const test = await db.query.pteSectionalTests.findFirst({
        where: eq(pteSectionalTests.id, id),
        with: {
            attempts: {
                orderBy: asc(pteSectionalAttempts.sequence),
                with: {
                    question: {
                        with: { questionType: true } // minimal
                    }
                }
            }
        }
    });

    if (!test) {
        notFound();
    }

    if (test.userId !== session.user.id) {
        redirect(routes.dashboard);
    }

    if (test.status === 'completed') {
        redirect(routes.academic.sectionalTest.result(id));
    }

    const currentAttempt = test.attempts.find(a => !a.attemptId);

    if (!currentAttempt) {
        // If no unattempted questions found but status not completed, assume completed?
        redirect(routes.academic.sectionalTest.result(id)); // Logic in API should handle status update
    }

    // Fetch full details
    const fullQuestion = await db.query.pteQuestions.findFirst({
        where: eq(pteQuestions.id, currentAttempt.questionId),
        with: {
            questionType: true,
            speaking: true,
            writing: true,
            reading: true,
            listening: true
        }
    });

    if (!fullQuestion) {
        return <div>Error loading question</div>;
    }

    // Serialize for Client Component
    const serializedQuestion = JSON.parse(JSON.stringify(fullQuestion));

    return (
        <SectionalTestRunner
            testId={id}
            initialQuestion={serializedQuestion}
            totalQuestions={test.attempts.length}
            initialIndex={currentAttempt.sequence}
            sectionTitle={`${test.section.charAt(0).toUpperCase() + test.section.slice(1)} Section Test`}
        />
    );
}
