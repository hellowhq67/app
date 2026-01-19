/**
 * API Registry - Complete list of all API endpoints with metadata
 */

export interface APIEndpoint {
    path: string;
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    description: string;
    category:
    | "PTE"
    | "Mock Test"
    | "Sectional Test"
    | "Scoring"
    | "User"
    | "Billing"
    | "Auth"
    | "System"
    | "Uploads"
    | "Analytics";
    requiresAuth: boolean;
    requestBody?: {
        type: string;
        example: any;
    };
    response: {
        type: string;
        example: any;
    };
    status: "stable" | "beta" | "deprecated";
}

export const API_REGISTRY: APIEndpoint[] = [
    // System APIs
    {
        path: "/api/health",
        method: "GET",
        description: "Health check endpoint to verify API availability",
        category: "System",
        requiresAuth: false,
        response: {
            type: "object",
            example: {
                ok: true,
                version: "1",
                timestamp: "2026-01-14T16:22:34.000Z",
                status: "healthy",
            },
        },
        status: "stable",
    },
    {
        path: "/api/debug",
        method: "GET",
        description: "Debug information for troubleshooting",
        category: "System",
        requiresAuth: false,
        response: {
            type: "object",
            example: {
                environment: "development",
                timestamp: "2026-01-14T16:22:34.000Z",
            },
        },
        status: "beta",
    },

    // PTE APIs
    {
        path: "/api/pte/questions",
        method: "GET",
        description: "Retrieve PTE practice questions by type and category",
        category: "PTE",
        requiresAuth: true,
        response: {
            type: "array",
            example: [
                {
                    id: "q1",
                    type: "READ_ALOUD",
                    content: "Sample question content",
                    difficulty: "medium",
                },
            ],
        },
        status: "stable",
    },
    {
        path: "/api/pte/categories",
        method: "GET",
        description: "Get all PTE question categories",
        category: "PTE",
        requiresAuth: true,
        response: {
            type: "array",
            example: [
                { id: "speaking", name: "Speaking", count: 45 },
                { id: "writing", name: "Writing", count: 30 },
            ],
        },
        status: "stable",
    },
    {
        path: "/api/pte/responses",
        method: "POST",
        description: "Submit a PTE question response",
        category: "PTE",
        requiresAuth: true,
        requestBody: {
            type: "object",
            example: {
                questionId: "q1",
                response: "User's answer",
                audioUrl: "https://...",
            },
        },
        response: {
            type: "object",
            example: {
                success: true,
                attemptId: "att123",
                feedback: "Good pronunciation",
            },
        },
        status: "stable",
    },
    {
        path: "/api/pte/score",
        method: "POST",
        description: "AI-powered scoring for PTE responses",
        category: "Scoring",
        requiresAuth: true,
        requestBody: {
            type: "object",
            example: {
                questionType: "READ_ALOUD",
                audioUrl: "https://...",
                transcript: "Transcribed text",
            },
        },
        response: {
            type: "object",
            example: {
                score: 85,
                pronunciation: 4.5,
                fluency: 4.0,
                feedback: "Excellent delivery",
            },
        },
        status: "stable",
    },
    {
        path: "/api/pte/session",
        method: "POST",
        description: "Create or update PTE practice session",
        category: "PTE",
        requiresAuth: true,
        requestBody: {
            type: "object",
            example: {
                questionType: "READ_ALOUD",
                startedAt: "2026-01-14T16:00:00Z",
            },
        },
        response: {
            type: "object",
            example: {
                sessionId: "sess123",
                expiresAt: "2026-01-14T17:00:00Z",
            },
        },
        status: "stable",
    },
    {
        path: "/api/pte/upload",
        method: "POST",
        description: "Upload audio/files for PTE practice",
        category: "Uploads",
        requiresAuth: true,
        requestBody: {
            type: "FormData",
            example: "audio file (multipart/form-data)",
        },
        response: {
            type: "object",
            example: {
                url: "https://storage.../audio.mp3",
                fileId: "file123",
            },
        },
        status: "stable",
    },

    // Mock Test APIs
    {
        path: "/api/mock-test/start",
        method: "POST",
        description: "Start a full 2-hour PTE mock test",
        category: "Mock Test",
        requiresAuth: true,
        requestBody: {
            type: "object",
            example: {
                testTemplateId: "template1",
            },
        },
        response: {
            type: "object",
            example: {
                testId: "test123",
                questions: [],
                startTime: "2026-01-14T16:00:00Z",
                endTime: "2026-01-14T18:00:00Z",
            },
        },
        status: "stable",
    },
    {
        path: "/api/mock-test/:id",
        method: "GET",
        description: "Get mock test details and current state",
        category: "Mock Test",
        requiresAuth: true,
        response: {
            type: "object",
            example: {
                testId: "test123",
                progress: 45,
                currentSection: "Speaking",
                timeRemaining: 3600,
            },
        },
        status: "stable",
    },
    {
        path: "/api/mock-test/submit",
        method: "POST",
        description: "Submit completed mock test for scoring",
        category: "Mock Test",
        requiresAuth: true,
        requestBody: {
            type: "object",
            example: {
                testId: "test123",
                responses: [],
            },
        },
        response: {
            type: "object",
            example: {
                overallScore: 75,
                sectionScores: {
                    speaking: 78,
                    writing: 72,
                    reading: 76,
                    listening: 74,
                },
            },
        },
        status: "stable",
    },

    // Sectional Test APIs
    {
        path: "/api/sectional-test/start",
        method: "POST",
        description: "Start a section-specific practice test",
        category: "Sectional Test",
        requiresAuth: true,
        requestBody: {
            type: "object",
            example: {
                section: "Speaking",
                questionTypes: ["READ_ALOUD", "REPEAT_SENTENCE"],
            },
        },
        response: {
            type: "object",
            example: {
                testId: "sect123",
                questions: [],
                duration: 1800,
            },
        },
        status: "stable",
    },
    {
        path: "/api/sectional-test/:id",
        method: "GET",
        description: "Get sectional test details",
        category: "Sectional Test",
        requiresAuth: true,
        response: {
            type: "object",
            example: {
                testId: "sect123",
                section: "Speaking",
                progress: 60,
            },
        },
        status: "stable",
    },
    {
        path: "/api/sectional-test/submit",
        method: "POST",
        description: "Submit sectional test for scoring",
        category: "Sectional Test",
        requiresAuth: true,
        requestBody: {
            type: "object",
            example: {
                testId: "sect123",
                responses: [],
            },
        },
        response: {
            type: "object",
            example: {
                sectionScore: 78,
                questionScores: [],
                feedback: "Strong performance",
            },
        },
        status: "stable",
    },

    // Scoring APIs
    {
        path: "/api/score/speaking",
        method: "POST",
        description: "AI scoring for speaking responses",
        category: "Scoring",
        requiresAuth: true,
        requestBody: {
            type: "object",
            example: {
                questionType: "READ_ALOUD",
                audioUrl: "https://...",
                transcript: "Transcribed text",
            },
        },
        response: {
            type: "object",
            example: {
                pronunciation: 4.5,
                fluency: 4.0,
                content: 4.5,
                overallScore: 85,
            },
        },
        status: "stable",
    },
    {
        path: "/api/score/writing",
        method: "POST",
        description: "AI scoring for writing responses",
        category: "Scoring",
        requiresAuth: true,
        requestBody: {
            type: "object",
            example: {
                questionType: "WRITE_ESSAY",
                text: "User's essay",
                wordCount: 280,
            },
        },
        response: {
            type: "object",
            example: {
                grammar: 4.5,
                vocabulary: 4.0,
                structure: 4.5,
                overallScore: 82,
            },
        },
        status: "stable",
    },
    {
        path: "/api/score/reading",
        method: "POST",
        description: "AI scoring for reading responses",
        category: "Scoring",
        requiresAuth: true,
        requestBody: {
            type: "object",
            example: {
                questionType: "MULTIPLE_CHOICE_SINGLE",
                selectedAnswer: "B",
                correctAnswer: "B",
            },
        },
        response: {
            type: "object",
            example: {
                correct: true,
                score: 100,
                explanation: "Correct answer",
            },
        },
        status: "stable",
    },
    {
        path: "/api/score/listening",
        method: "POST",
        description: "AI scoring for listening responses",
        category: "Scoring",
        requiresAuth: true,
        requestBody: {
            type: "object",
            example: {
                questionType: "SUMMARIZE_SPOKEN_TEXT",
                text: "User's summary",
            },
        },
        response: {
            type: "object",
            example: {
                content: 4.0,
                grammar: 4.5,
                vocabulary: 4.0,
                overallScore: 80,
            },
        },
        status: "stable",
    },

    // User APIs
    {
        path: "/api/user/profile",
        method: "GET",
        description: "Get current user profile",
        category: "User",
        requiresAuth: true,
        response: {
            type: "object",
            example: {
                id: "user123",
                email: "user@example.com",
                name: "John Doe",
                targetScore: 79,
            },
        },
        status: "stable",
    },
    {
        path: "/api/user/profile",
        method: "PUT",
        description: "Update user profile",
        category: "User",
        requiresAuth: true,
        requestBody: {
            type: "object",
            example: {
                name: "John Doe",
                targetScore: 79,
                examDate: "2026-02-15",
            },
        },
        response: {
            type: "object",
            example: {
                success: true,
                updatedFields: ["name", "targetScore"],
            },
        },
        status: "stable",
    },
    {
        path: "/api/user/change-password",
        method: "POST",
        description: "Change user password",
        category: "User",
        requiresAuth: true,
        requestBody: {
            type: "object",
            example: {
                currentPassword: "old123",
                newPassword: "new456",
            },
        },
        response: {
            type: "object",
            example: {
                success: true,
                message: "Password updated",
            },
        },
        status: "stable",
    },
    {
        path: "/api/user/enable-2fa",
        method: "POST",
        description: "Enable two-factor authentication",
        category: "User",
        requiresAuth: true,
        response: {
            type: "object",
            example: {
                qrCode: "data:image/png;base64,...",
                secret: "SECRET123",
            },
        },
        status: "beta",
    },
    {
        path: "/api/user/exam-dates/:dateId",
        method: "PUT",
        description: "Update exam date",
        category: "User",
        requiresAuth: true,
        requestBody: {
            type: "object",
            example: {
                examDate: "2026-02-15",
                targetScore: 79,
            },
        },
        response: {
            type: "object",
            example: {
                success: true,
                examDate: "2026-02-15",
            },
        },
        status: "stable",
    },

    // Billing APIs
    {
        path: "/api/billing/subscription",
        method: "GET",
        description: "Get current subscription details",
        category: "Billing",
        requiresAuth: true,
        response: {
            type: "object",
            example: {
                plan: "premium",
                status: "active",
                renewsAt: "2026-02-14",
            },
        },
        status: "stable",
    },
    {
        path: "/api/billing/subscription",
        method: "POST",
        description: "Create or update subscription",
        category: "Billing",
        requiresAuth: true,
        requestBody: {
            type: "object",
            example: {
                planId: "premium-monthly",
                paymentMethodId: "pm_123",
            },
        },
        response: {
            type: "object",
            example: {
                success: true,
                subscriptionId: "sub_123",
            },
        },
        status: "stable",
    },
    {
        path: "/api/billing/credits/purchase",
        method: "POST",
        description: "Purchase additional credits",
        category: "Billing",
        requiresAuth: true,
        requestBody: {
            type: "object",
            example: {
                credits: 100,
                paymentMethodId: "pm_123",
            },
        },
        response: {
            type: "object",
            example: {
                success: true,
                newBalance: 250,
            },
        },
        status: "stable",
    },
    {
        path: "/api/billing/credits/history",
        method: "GET",
        description: "Get credit transaction history",
        category: "Billing",
        requiresAuth: true,
        response: {
            type: "array",
            example: [
                {
                    id: "txn123",
                    type: "purchase",
                    amount: 100,
                    date: "2026-01-14",
                },
            ],
        },
        status: "stable",
    },
    {
        path: "/api/billing/invoices",
        method: "GET",
        description: "Get user invoices",
        category: "Billing",
        requiresAuth: true,
        response: {
            type: "array",
            example: [
                {
                    id: "inv123",
                    amount: 29.99,
                    status: "paid",
                    date: "2026-01-01",
                },
            ],
        },
        status: "stable",
    },

    // Analytics APIs
    {
        path: "/api/dashboard/feature-stats",
        method: "GET",
        description: "Get user practice statistics",
        category: "Analytics",
        requiresAuth: true,
        response: {
            type: "object",
            example: {
                totalAttempts: 156,
                averageScore: 75,
                improvementRate: 12,
            },
        },
        status: "stable",
    },
    {
        path: "/api/dashboard/study-tools-progress",
        method: "GET",
        description: "Get study progress across different tools",
        category: "Analytics",
        requiresAuth: true,
        response: {
            type: "object",
            example: {
                speaking: { completed: 45, total: 100 },
                writing: { completed: 30, total: 80 },
            },
        },
        status: "stable",
    },
    {
        path: "/api/attempts",
        method: "GET",
        description: "Get user's practice attempt history",
        category: "Analytics",
        requiresAuth: true,
        response: {
            type: "array",
            example: [
                {
                    id: "att123",
                    questionType: "READ_ALOUD",
                    score: 85,
                    createdAt: "2026-01-14",
                },
            ],
        },
        status: "stable",
    },

    // Upload APIs
    {
        path: "/api/uploads/audio",
        method: "POST",
        description: "Upload audio files",
        category: "Uploads",
        requiresAuth: true,
        requestBody: {
            type: "FormData",
            example: "audio file (multipart/form-data)",
        },
        response: {
            type: "object",
            example: {
                url: "https://storage.../audio.mp3",
                fileId: "file123",
                duration: 45,
            },
        },
        status: "stable",
    },
    {
        path: "/api/uploads/general",
        method: "POST",
        description: "Upload general files (images, documents)",
        category: "Uploads",
        requiresAuth: true,
        requestBody: {
            type: "FormData",
            example: "file (multipart/form-data)",
        },
        response: {
            type: "object",
            example: {
                url: "https://storage.../file.pdf",
                fileId: "file123",
            },
        },
        status: "stable",
    },

    // AI Assistant APIs
    {
        path: "/api/ai-assistant",
        method: "POST",
        description: "Chat with AI study assistant",
        category: "PTE",
        requiresAuth: true,
        requestBody: {
            type: "object",
            example: {
                message: "How can I improve my speaking score?",
                context: "speaking",
            },
        },
        response: {
            type: "object",
            example: {
                reply: "Here are some tips...",
                suggestions: ["Practice daily", "Focus on fluency"],
            },
        },
        status: "beta",
    },

    // Search APIs
    {
        path: "/api/search",
        method: "GET",
        description: "Search across questions and content",
        category: "PTE",
        requiresAuth: true,
        response: {
            type: "array",
            example: [
                {
                    id: "q1",
                    type: "question",
                    title: "Read Aloud Practice",
                    relevance: 0.95,
                },
            ],
        },
        status: "stable",
    },

    // Bookmark APIs
    {
        path: "/api/questions/bookmark",
        method: "POST",
        description: "Bookmark a question for later review",
        category: "PTE",
        requiresAuth: true,
        requestBody: {
            type: "object",
            example: {
                questionId: "q123",
                bookmarked: true,
            },
        },
        response: {
            type: "object",
            example: {
                success: true,
                bookmarked: true,
            },
        },
        status: "stable",
    },

    // Contact API
    {
        path: "/api/contact",
        method: "POST",
        description: "Submit contact form",
        category: "System",
        requiresAuth: false,
        requestBody: {
            type: "object",
            example: {
                name: "John Doe",
                email: "john@example.com",
                message: "I need help with...",
            },
        },
        response: {
            type: "object",
            example: {
                success: true,
                ticketId: "ticket123",
            },
        },
        status: "stable",
    },
];

export function getAPIsByCategory(category: string): APIEndpoint[] {
    return API_REGISTRY.filter((api) => api.category === category);
}

export function getAPIsRequiringAuth(): APIEndpoint[] {
    return API_REGISTRY.filter((api) => api.requiresAuth);
}

export function searchAPIs(query: string): APIEndpoint[] {
    const lowerQuery = query.toLowerCase();
    return API_REGISTRY.filter(
        (api) =>
            api.path.toLowerCase().includes(lowerQuery) ||
            api.description.toLowerCase().includes(lowerQuery)
    );
}
