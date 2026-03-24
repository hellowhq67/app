import { Redis } from '@upstash/redis'

// Initialize Redis only when valid credentials are present.
// Prevents build-time crashes when env vars are not configured.
const url = process.env.UPSTASH_REDIS_REST_URL
const token = process.env.UPSTASH_REDIS_REST_TOKEN

export const redis: Redis | null = (() => {
    if (!url?.startsWith('https://') || !token) return null
    try {
        return new Redis({ url, token })
    } catch {
        return null
    }
})()

/**
 * Helper to get cached data safely
 */
export async function getCached<T>(key: string): Promise<T | null> {
    if (!redis) return null
    try {
        return await redis.get<T>(key)
    } catch {
        if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ [Redis] Cache get failed - continuing without cache')
        }
        return null
    }
}

/**
 * Helper to set cached data safely
 */
export async function setCached(
    key: string,
    data: unknown,
    ttlSeconds: number = 3600
): Promise<void> {
    if (!redis) return
    try {
        await redis.set(key, data, { ex: ttlSeconds })
    } catch {
        if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ [Redis] Cache set failed')
        }
    }
}

/**
 * Helper to delete cached data
 */
export async function delCached(key: string): Promise<void> {
    if (!redis) return
    try {
        await redis.del(key)
    } catch {
        if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ [Redis] Cache del failed')
        }
    }
}
