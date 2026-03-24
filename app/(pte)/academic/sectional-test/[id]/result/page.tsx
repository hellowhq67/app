export const dynamic = 'force-dynamic';

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { pteSectionalTests, pteSectionalAttempts } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import ModernResultsView from "@/components/pte/sectional-test/ModernResultsView";
import { routes } from "@/lib/config/navigation";

export default async function SectionalTestResultPage({
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
                    originalAttempt: true
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

    // Calculate aggregated scores
    let totalAggregatedScore = 0;
    let validAttempts = 0;

    test.attempts.forEach(a => {
        if (a.originalAttempt?.aiFeedback) {
            const feedback = typeof a.originalAttempt.aiFeedback === 'string'
                ? JSON.parse(a.originalAttempt.aiFeedback)
                : a.originalAttempt.aiFeedback;

            totalAggregatedScore += (feedback?.overallScore || feedback?.score || 0);
            validAttempts++;
        }
    });

    // Simple scaling for demonstration - in a real app this would follow official scaling
    const normalizedScore = validAttempts > 0 ? Math.round(totalAggregatedScore / validAttempts) : 0;

    const scores = {
        speaking: test.section === 'speaking' ? normalizedScore : 0,
        writing: test.section === 'writing' ? normalizedScore : 0,
        reading: test.section === 'reading' ? normalizedScore : 0,
        listening: test.section === 'listening' ? normalizedScore : 0,
    };

    return (
        <main className="min-h-screen bg-[#0a0a14]">
            <ModernResultsView
                scores={scores}
                overallScore={normalizedScore}
            />
        </main>
    );
}
