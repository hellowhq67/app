import {
    CopilotRuntime,
    GoogleGenerativeAIAdapter,
    copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";
import { db } from "@/lib/db/drizzle";
import { pteAttempts, pteQuestions, users, userProgress } from "@/lib/db/schema";
import { eq, desc, and, gte, sql } from "drizzle-orm";
import { z } from "zod";

// Use Google AI adapter with Gemini
const serviceAdapter = new GoogleGenerativeAIAdapter({
    model: "gemini-2.0-flash-exp",
});

// Define actions for the AI assistant
const runtime = new CopilotRuntime({
    actions: () => {
        return [
            {
                name: "getUserPracticeHistory",
                description: "Get the user's practice history including recent attempts and scores across all sections (Speaking, Writing, Reading, Listening)",
                parameters: [
                    {
                        name: "userId",
                        type: "string",
                        description: "The ID of the user",
                        required: true,
                    },
                    {
                        name: "section",
                        type: "string",
                        description: "Filter by section (speaking, writing, reading, listening) or 'all' for all sections",
                        required: false,
                    },
                    {
                        name: "limit",
                        type: "number",
                        description: "Number of recent attempts to fetch (default: 10)",
                        required: false,
                    }
                ],
                handler: async ({ userId, section, limit = 10 }: { userId: string; section?: string; limit?: number }) => {
                    try {
                        let query = db
                            .select({
                                id: pteAttempts.id,
                                questionId: pteAttempts.questionId,
                                score: pteAttempts.score,
                                overallScore: pteAttempts.overallScore,
                                createdAt: pteAttempts.createdAt,
                                questionType: pteQuestions.questionType,
                                section: pteQuestions.section,
                                title: pteQuestions.title,
                            })
                            .from(pteAttempts)
                            .leftJoin(pteQuestions, eq(pteAttempts.questionId, pteQuestions.id))
                            .where(eq(pteAttempts.userId, userId))
                            .orderBy(desc(pteAttempts.createdAt))
                            .limit(limit);

                        const attempts = await query;

                        // Filter by section if provided
                        const filteredAttempts = section && section !== 'all' 
                            ? attempts.filter(a => a.section?.toLowerCase() === section.toLowerCase())
                            : attempts;

                        return {
                            attempts: filteredAttempts.map(a => ({
                                id: a.id,
                                questionType: a.questionType,
                                section: a.section,
                                title: a.title,
                                score: a.score || a.overallScore,
                                date: a.createdAt,
                            })),
                            totalAttempts: filteredAttempts.length,
                        };
                    } catch (error) {
                        console.error("Error fetching practice history:", error);
                        return { error: "Failed to fetch practice history" };
                    }
                },
            },
            {
                name: "getUserProgress",
                description: "Get detailed user progress including study streak, total time spent, and average scores by section",
                parameters: [
                    {
                        name: "userId",
                        type: "string",
                        description: "The ID of the user",
                        required: true,
                    }
                ],
                handler: async ({ userId }: { userId: string }) => {
                    try {
                        const progress = await db.query.userProgress.findFirst({
                            where: eq(userProgress.userId, userId),
                        });

                        if (!progress) {
                            return {
                                studyStreak: 0,
                                totalStudyTime: 0,
                                questionsAnswered: 0,
                                testsCompleted: 0,
                                averageScore: 0,
                            };
                        }

                        return {
                            studyStreak: progress.studyStreak,
                            totalStudyTime: progress.totalStudyTime,
                            questionsAnswered: progress.questionsAnswered,
                            testsCompleted: progress.testsCompleted,
                            averageScore: progress.averageScore,
                            lastActiveAt: progress.lastActiveAt,
                        };
                    } catch (error) {
                        console.error("Error fetching user progress:", error);
                        return { error: "Failed to fetch user progress" };
                    }
                },
            },
            {
                name: "getWeakAreas",
                description: "Identify the user's weak areas based on their practice scores across different question types",
                parameters: [
                    {
                        name: "userId",
                        type: "string",
                        description: "The ID of the user",
                        required: true,
                    },
                    {
                        name: "threshold",
                        type: "number",
                        description: "Score threshold below which areas are considered weak (default: 50)",
                        required: false,
                    }
                ],
                handler: async ({ userId, threshold = 50 }: { userId: string; threshold?: number }) => {
                    try {
                        const attempts = await db
                            .select({
                                questionType: pteQuestions.questionType,
                                section: pteQuestions.section,
                                score: pteAttempts.score,
                                overallScore: pteAttempts.overallScore,
                            })
                            .from(pteAttempts)
                            .leftJoin(pteQuestions, eq(pteAttempts.questionId, pteQuestions.id))
                            .where(eq(pteAttempts.userId, userId));

                        // Calculate average scores by question type
                        const scoresByType: Record<string, number[]> = {};
                        
                        attempts.forEach(attempt => {
                            const type = attempt.questionType || 'unknown';
                            const score = attempt.score || attempt.overallScore || 0;
                            
                            if (!scoresByType[type]) {
                                scoresByType[type] = [];
                            }
                            scoresByType[type].push(score);
                        });

                        const weakAreas = Object.entries(scoresByType)
                            .map(([type, scores]) => ({
                                questionType: type,
                                averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
                                attemptCount: scores.length,
                            }))
                            .filter(area => area.averageScore < threshold)
                            .sort((a, b) => a.averageScore - b.averageScore);

                        return {
                            weakAreas,
                            totalTypesAnalyzed: Object.keys(scoresByType).length,
                            threshold,
                        };
                    } catch (error) {
                        console.error("Error analyzing weak areas:", error);
                        return { error: "Failed to analyze weak areas" };
                    }
                },
            },
            {
                name: "getTodayStats",
                description: "Get statistics for today's practice including attempts count and time spent",
                parameters: [
                    {
                        name: "userId",
                        type: "string",
                        description: "The ID of the user",
                        required: true,
                    }
                ],
                handler: async ({ userId }: { userId: string }) => {
                    try {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        const todayAttempts = await db
                            .select()
                            .from(pteAttempts)
                            .where(
                                and(
                                    eq(pteAttempts.userId, userId),
                                    gte(pteAttempts.createdAt, today)
                                )
                            );

                        return {
                            attemptsToday: todayAttempts.length,
                            averageScoreToday: todayAttempts.length > 0
                                ? todayAttempts.reduce((sum, a) => sum + (a.score || a.overallScore || 0), 0) / todayAttempts.length
                                : 0,
                        };
                    } catch (error) {
                        console.error("Error fetching today's stats:", error);
                        return { error: "Failed to fetch today's statistics" };
                    }
                },
            },
        ];
    },
});

export const POST = async (req: NextRequest) => {
    const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
        runtime,
        serviceAdapter,
        endpoint: "/api/copilotkit",
    });

    return handleRequest(req);
}