export const dynamic = 'force-dynamic';


import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAllUserAttempts } from "@/lib/db/queries/pte-scoring";
import { getUserDashboardStats } from "@/lib/pte/practice";
import { PTEDashboard } from "@/components/pte/app-dashboard";
import { useCopilotReadable } from "@copilotkit/react-core";

import { CopilotPopup } from "@copilotkit/react-ui";
export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/sign-in');
  }

  // Fetch user data and dashboard stats in parallel
  const [userProfile, dashboardStats, attempts] = await Promise.all([
    db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    }),
    getUserDashboardStats(session.user.id),
    getAllUserAttempts(session.user.id),
  ]);

  // Aggregate stats for chart
  const categoryStats = new Map<string, { total: number; count: number }>();

  attempts.forEach((attempt) => {
    const question = attempt.question as any;
    let categoryName = question?.questionType?.category?.name || "Other";
    categoryName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

    const score = attempt.finalScore || attempt.aiScore || 0;

    const current = categoryStats.get(categoryName) || { total: 0, count: 0 };
    categoryStats.set(categoryName, {
      total: current.total + score,
      count: current.count + 1,
    });
  });

  const colorMap: Record<string, string> = {
    Speaking: "#3b82f6",
    Writing: "#10b981",
    Reading: "#f59e0b",
    Listening: "#ef4444",
  };

  const chartData = Array.from(categoryStats.entries()).map(
    ([name, stats]) => ({
      name,
      score: Math.round(stats.total / stats.count),
      color: colorMap[name] || "#94a3b8",
    })
  );

  // Count today's attempts
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayAttempts = attempts.filter((a) => {
    const attemptDate = new Date(a.createdAt);
    attemptDate.setHours(0, 0, 0, 0);
    return attemptDate.getTime() === today.getTime();
  }).length;

  const stats = {
    todayAttempts,
    totalAttempts: dashboardStats.totalQuestions,
    studyStreak: dashboardStats.studyStreak,
    targetScore: dashboardStats.targetScore,
    overallScore: dashboardStats.overallScore,
    sectionScores: dashboardStats.sectionScores,
    recentAttempts: dashboardStats.recentAttempts,
  };

  return (
    <>
      <PTEDashboard
        user={userProfile || session.user}
        examDate={dashboardStats.examDate || userProfile?.examDate || null}
        chartData={chartData}
        stats={stats}
      />

      <CopilotPopup
        instructions={prompt}
        defaultOpen
        labels={{
          title: "✨ Incident Report Assistant",
          initial: [
            "I'm an AI assistant built for guiding you through filing incident reports. How can I help?",
          ],
        }}
      />
    </>
  );
}
