import { z } from 'zod';
import { config } from 'dotenv'

// Load environment variables for non-Next.js contexts (like seeding or migrations)
if (process.env.NODE_ENV !== 'production') {
    config({ path: '.env.local' })
    config()
}

const envSchema = z.object({
    // Core
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    ANALYZE: z.string().optional(),
    GIT_HASH: z.string().optional(),

    DATABASE_URL: z.string().min(1).optional(),
    DATABASE_URL_POOLED: z.string().optional(),
    DATABASE_PUBLIC_URL: z.string().optional(),
    MASTERPASS: z.string().optional(),


    BETTER_AUTH_SECRET: z.string().min(1).optional(),
    BETTER_AUTH_URL: z.string().url().optional(),
    AUTH_SECRET: z.string().min(1).optional(),
    NEXT_PUBLIC_BETTER_AUTH_URL: z.string().url().optional(),

    // OAuth Providers
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    FACEBOOK_CLIENT_ID: z.string().optional(),
    FACEBOOK_CLIENT_SECRET: z.string().optional(),
    APPLE_CLIENT_ID: z.string().optional(),
    APPLE_CLIENT_SECRET: z.string().optional(),

    // AI Services - Google/Gemini
    GOOGLE_API_KEY: z.string().optional(),
    GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),
    GEMINI_API_KEY: z.string().optional(),
    AI_GATEWAY_API_KEY: z.string().optional(),
    AI_GATEWAY_URL: z.string().optional(),

    // AI Services - Others
    OPENAI_API_KEY: z.string().optional(),
    ASSEMBLYAI_API_KEY: z.string().optional(),
    ELEVENLABS_API_KEY: z.string().optional(),
    ELEVENLABS_AGENT_ID: z.string().optional(),
    CONTEXT7_API_KEY: z.string().optional(),
    KERNEL_API_KEY: z.string().optional(),
    MXBAI_API_KEY: z.string().optional(),
    MXBAI_STORE_ID: z.string().optional(),

    // Vercel / Storage
    BLOB_READ_WRITE_TOKEN: z.string().optional(),
    
    // Redis / Upstash
    KV_REST_API_READ_ONLY_TOKEN: z.string().optional(),
    KV_REST_API_TOKEN: z.string().optional(),
    KV_REST_API_URL: z.string().optional(),
    KV_URL: z.string().optional(),
    REDIS_URL: z.string().optional(),
    UPSTASH_REDIS_REST_URL: z.string().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

    // Monitoring (Rollbar)
    ROLLBAR_PEDAGOGISTPTE_CLIENT_TOKEN_1763820319: z.string().optional(),
    ROLLBAR_PEDAGOGISTPTE_SERVER_TOKEN_1763820319: z.string().optional(),
    ROLLBAR_PTE_SERVER_TOKEN_1763567104: z.string().optional(),

    // Infrastructure / Others
    MUX_TOKEN_ID: z.string().optional(),
    MUX_TOKEN_SECRET: z.string().optional(),
    RAILWAY_PROJECT_NAME: z.string().optional(),
    RAILWAY_ENVIRONMENT_NAME: z.string().optional(),
    POLLER_ID_PRODUCT: z.string().optional(),
    VERCEL_OIDC_TOKEN: z.string().optional(),
})

// Define which variables are available on the client
const clientEnvSchema = z.object({
    NEXT_PUBLIC_BETTER_AUTH_URL: z.string().url().optional(),
})

const processEnv = {
    NODE_ENV: process.env.NODE_ENV,
    ANALYZE: process.env.ANALYZE,
    GIT_HASH: process.env.GIT_HASH,
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_URL_POOLED: process.env.DATABASE_URL_POOLED,
    DATABASE_PUBLIC_URL: process.env.DATABASE_PUBLIC_URL,
    MASTERPASS: process.env.MASTERPASS,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    FACEBOOK_CLIENT_ID: process.env.FACEBOOK_CLIENT_ID,
    FACEBOOK_CLIENT_SECRET: process.env.FACEBOOK_CLIENT_SECRET,
    APPLE_CLIENT_ID: process.env.APPLE_CLIENT_ID,
    APPLE_CLIENT_SECRET: process.env.APPLE_CLIENT_SECRET,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    AI_GATEWAY_API_KEY: process.env.AI_GATEWAY_API_KEY,
    AI_GATEWAY_URL: process.env.AI_GATEWAY_URL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ASSEMBLYAI_API_KEY: process.env.ASSEMBLYAI_API_KEY,
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
    ELEVENLABS_AGENT_ID: process.env.ELEVENLABS_AGENT_ID,
    CONTEXT7_API_KEY: process.env.CONTEXT7_API_KEY,
    KERNEL_API_KEY: process.env.KERNEL_API_KEY,
    MXBAI_API_KEY: process.env.MXBAI_API_KEY,
    MXBAI_STORE_ID: process.env.MXBAI_STORE_ID,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
    KV_REST_API_READ_ONLY_TOKEN: process.env.KV_REST_API_READ_ONLY_TOKEN,
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
    KV_REST_API_URL: process.env.KV_REST_API_URL,
    KV_URL: process.env.KV_URL,
    REDIS_URL: process.env.REDIS_URL,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    ROLLBAR_PEDAGOGISTPTE_CLIENT_TOKEN_1763820319: process.env.ROLLBAR_PEDAGOGISTPTE_CLIENT_TOKEN_1763820319,
    ROLLBAR_PEDAGOGISTPTE_SERVER_TOKEN_1763820319: process.env.ROLLBAR_PEDAGOGISTPTE_SERVER_TOKEN_1763820319,
    ROLLBAR_PTE_SERVER_TOKEN_1763567104: process.env.ROLLBAR_PTE_SERVER_TOKEN_1763567104,
    MUX_TOKEN_ID: process.env.MUX_TOKEN_ID,
    MUX_TOKEN_SECRET: process.env.MUX_TOKEN_SECRET,
    RAILWAY_PROJECT_NAME: process.env.RAILWAY_PROJECT_NAME,
    RAILWAY_ENVIRONMENT_NAME: process.env.RAILWAY_ENVIRONMENT_NAME,
    POLLER_ID_PRODUCT: process.env.POLLER_ID_PRODUCT,
    VERCEL_OIDC_TOKEN: process.env.VERCEL_OIDC_TOKEN,
}

// Validate env vars
const parsed = envSchema.safeParse(processEnv)

if (!parsed.success) {
    console.error('❌ Invalid environment variables:', JSON.stringify(parsed.error.flatten().fieldErrors, null, 2))
    throw new Error('Invalid environment variables')
}

export const env = parsed.data

