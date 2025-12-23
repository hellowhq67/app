import { Redis } from '@upstash/redis'

// Initialize Redis client
// It automatically attempts to read UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN from .env
const redis = Redis.fromEnv()

export { redis }

/**
 * Helper to get cached data safely
 */
export async function getCached<T>(key: string): Promise<T | null> {
    try {
        // Upstash Redis returns the object directly if it was stored as JSON
        const data = await redis.get<T>(key)
        return data
    } catch (error) {
        // Only log error in development, and even then, make it less noisy
        if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ [Redis] Cache get failed - continuing without cache');
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
    try {
        await redis.set(key, data, { ex: ttlSeconds })
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ [Redis] Cache set failed');
        }
    }
}

/**
 * Helper to delete cached data
 */
export async function delCached(key: string): Promise<void> {
    try {
        await redis.del(key)
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ [Redis] Cache del failed');
        }
    }
}
