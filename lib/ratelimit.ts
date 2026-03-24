import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";

// If Redis is not configured, ratelimiters are null — callers must handle this.
export const ratelimit: Ratelimit | null = redis
    ? new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(10, "10 s"),
          analytics: true,
          prefix: "@upstash/ratelimit",
      })
    : null;

// Stricter limiter for creating tests/content
export const strictRatelimit: Ratelimit | null = redis
    ? new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(2, "60 s"),
          analytics: true,
          prefix: "@upstash/strict-ratelimit",
      })
    : null;
