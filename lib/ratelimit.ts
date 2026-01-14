import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis"; // Assumes we have this, or I'll use @upstash/redis directly if not.

// Create a new ratelimiter, that allows 10 requests per 10 seconds
export const ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(10, "10 s"),
    analytics: true,
    prefix: "@upstash/ratelimit",
});

// Stricter limiter for creating tests/content
export const strictRatelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(2, "60 s"), // 2 start attempts per minute
    analytics: true,
    prefix: "@upstash/strict-ratelimit",
});
