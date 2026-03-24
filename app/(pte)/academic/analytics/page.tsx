export const dynamic = 'force-dynamic';

import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'
import { getAllUserAttempts } from '@/lib/db/queries/pte-scoring'
import { redirect } from 'next/navigation'
import { AnalyticsClient } from '@/components/pte/analytics/analytics-client'
import { QuestionType } from '@/lib/types'
import { routes } from '@/lib/config/navigation'



export default async function AnalyticsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect(routes.auth.signIn)
  }

  const attempts = await getAllUserAttempts(session.user.id)

  // Calculate stats
  const totalAttempts = attempts.length
  const scores = attempts.map(a => a.finalScore || a.aiScore || 0)
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0

  // Skill data
  const skillMap = new Map<string, { total: number; count: number }>()
  attempts.forEach(a => {
    const question = a.question;
    // Use category name from DB relation
    let skill = question?.questionType?.category?.name || 'Other';
    skill = skill.charAt(0).toUpperCase() + skill.slice(1);

    const score = a.finalScore || a.aiScore || 0;

    const current = skillMap.get(skill) || { total: 0, count: 0 };
    skillMap.set(skill, { total: current.total + score, count: current.count + 1 });
  });

  const skillData = Array.from(skillMap.entries()).map(([skill, data]) => ({
    skill,
    current: Math.round(data.total / data.count),
    previous: 0, // Need historical comparison logic for real 'previous'
    improvement: 0
  }));

  // Ensure we have all 4 skills represented if possible, or just what user has done.
  // For now let's just show what they have done.

  const history = attempts
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map(a => ({
      date: new Date(a.createdAt).toLocaleDateString(),
      score: a.finalScore || a.aiScore || 0
    }));

  const recentTests = attempts.slice(0, 5).map(a => ({
    title: a.question.title || 'Practice Question',
    date: new Date(a.createdAt).toLocaleDateString(),
    score: a.finalScore || a.aiScore || 0,
    sections: [a.finalScore || a.aiScore || 0] // Simplified as single section practice
  }));

  const data = {
    overallScore: avgScore,
    bestScore,
    completedTests: totalAttempts,
    skillData,
    history,
    recentTests
  };

  return <AnalyticsClient data={data} />
}
