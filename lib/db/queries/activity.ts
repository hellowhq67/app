import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '../drizzle'
import { activityLogs } from '../schema'

/**
 * Log a user activity/action to the database.
 */
export async function logActivity(action: string, ipAddress?: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        })
        if (!session?.user) return

        await db.insert(activityLogs).values({
            userId: session.user.id,
            action,
            ipAddress: ipAddress || null,
        })
    } catch (error) {
        console.error('Error in logActivity query:', error)
    }
}
