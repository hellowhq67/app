import "server-only";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface HealthCheck {
    service: string;
    status: "healthy" | "degraded" | "down";
    latency: number;
    message?: string;
}

async function checkDatabase(): Promise<HealthCheck> {
    const start = Date.now();
    try {
        // Simple query to check database connectivity
        await db.execute(sql`SELECT 1`);
        const latency = Date.now() - start;

        return {
            service: "database",
            status: latency < 100 ? "healthy" : "degraded",
            latency,
            message: latency > 100 ? "High latency detected" : undefined,
        };
    } catch (error) {
        return {
            service: "database",
            status: "down",
            latency: Date.now() - start,
            message: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

async function checkExternalServices(): Promise<HealthCheck[]> {
    const checks: HealthCheck[] = [];

    // Check Google AI
    const aiStart = Date.now();
    try {
        const aiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (aiKey) {
            checks.push({
                service: "google-ai",
                status: "healthy",
                latency: Date.now() - aiStart,
                message: "API key configured",
            });
        } else {
            checks.push({
                service: "google-ai",
                status: "degraded",
                latency: Date.now() - aiStart,
                message: "API key not configured",
            });
        }
    } catch (error) {
        checks.push({
            service: "google-ai",
            status: "down",
            latency: Date.now() - aiStart,
            message: "Configuration error",
        });
    }

    // Check AssemblyAI
    const assemblyStart = Date.now();
    try {
        const assemblyKey = process.env.ASSEMBLYAI_API_KEY;
        if (assemblyKey) {
            checks.push({
                service: "assemblyai",
                status: "healthy",
                latency: Date.now() - assemblyStart,
                message: "API key configured",
            });
        } else {
            checks.push({
                service: "assemblyai",
                status: "degraded",
                latency: Date.now() - assemblyStart,
                message: "API key not configured",
            });
        }
    } catch (error) {
        checks.push({
            service: "assemblyai",
            status: "down",
            latency: Date.now() - assemblyStart,
            message: "Configuration error",
        });
    }

    return checks;
}

export async function GET() {
    const startTime = Date.now();

    try {
        // Run all health checks
        const [dbCheck, externalChecks] = await Promise.all([
            checkDatabase(),
            checkExternalServices(),
        ]);

        const allChecks = [dbCheck, ...externalChecks];
        const overallStatus = allChecks.every((c) => c.status === "healthy")
            ? "healthy"
            : allChecks.some((c) => c.status === "down")
                ? "down"
                : "degraded";

        const response = {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: "1.0.0",
            totalLatency: Date.now() - startTime,
            checks: allChecks,
            environment: process.env.NODE_ENV || "development",
            memoryUsage: {
                rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
                heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
            },
        };

        return NextResponse.json(response, {
            status: overallStatus === "healthy" ? 200 : overallStatus === "degraded" ? 206 : 503,
            headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate",
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        return NextResponse.json(
            {
                status: "down",
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 503 }
        );
    }
}
