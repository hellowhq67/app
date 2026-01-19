import "server-only";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface TestRequest {
    path: string;
    method: string;
    body?: any;
    headers?: Record<string, string>;
}

export async function POST(req: Request) {
    try {
        const { path, method, body, headers }: TestRequest = await req.json();

        // Create the test request
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const url = `${baseUrl}${path}`;

        const startTime = Date.now();

        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                ...headers,
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        const latency = Date.now() - startTime;

        let responseData;
        const contentType = response.headers.get("content-type");

        if (contentType?.includes("application/json")) {
            responseData = await response.json();
        } else {
            responseData = await response.text();
        }

        return NextResponse.json({
            success: response.ok,
            status: response.status,
            statusText: response.statusText,
            latency,
            data: responseData,
            headers: Object.fromEntries(response.headers.entries()),
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
