export const dynamic = 'force-dynamic';


import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getUserMockTests } from '@/lib/pte/analytics'
import { AnalyticsDashboard } from '@/components/pte/analytics/AnalyticsDashboard'

export default async function AnalyticsPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect('/sign-in')
  }

  const mockTests = await getUserMockTests(session.user.id)

  return <AnalyticsDashboard mockTests={mockTests} />
}
