"use client";

import { CopilotSidebar } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import { useCopilotReadable } from "@copilotkit/react-core";
import { MessageCircle, Sparkles } from "lucide-react";
import { useSession } from "@/lib/auth/client";
import { useEffect, useState } from "react";

interface UserData {
    user: {
        id: string;
        name: string;
        email: string;
    } | null;
    stats: {
        todayAttempts: number;
        totalAttempts: number;
        studyStreak: number;
        overallScore: number;
        sectionScores: {
            speaking: number;
            writing: number;
            reading: number;
            listening: number;
        };
    };
}

interface PTECopilotAssistantProps {
    userData?: UserData;
}

export function PTECopilotAssistant({ userData }: PTECopilotAssistantProps) {
    const { data: session } = useSession();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Make user data available to the AI
    useCopilotReadable({
        description: "Current user information including name, email, and user ID for personalized assistance",
        value: session?.user
            ? {
                id: session.user.id,
                name: session.user.name,
                email: session.user.email,
            }
            : null,
    });

    // Make practice statistics available to the AI
    useCopilotReadable({
        description:
            "User's PTE practice statistics including daily attempts, total attempts, study streak, and section-wise scores (Speaking, Writing, Reading, Listening). Use this data to provide personalized insights and recommendations.",
        value: userData?.stats || {
            todayAttempts: 0,
            totalAttempts: 0,
            studyStreak: 0,
            overallScore: 0,
            sectionScores: {
                speaking: 0,
                writing: 0,
                reading: 0,
                listening: 0,
            },
        },
    });

    if (!mounted) return null;

    const userName = session?.user?.name || "Student";
    const studyStreak = userData?.stats?.studyStreak || 0;
    const overallScore = userData?.stats?.overallScore || 0;

    const prompt = `You are an expert PTE Academic assistant for PedagogistsPTE, a premium PTE preparation platform. Your role is to:

1. **Analyze Performance**: Help users understand their practice data, identify weak areas, and track progress across Speaking, Writing, Reading, and Listening sections. Use the available tools to fetch detailed analytics.

2. **Provide Actionable Advice**: Offer specific, personalized study recommendations based on the user's performance data and practice history. For example:
   - If speaking scores are low, suggest practicing Read Aloud and Repeat Sentence
   - If writing needs improvement, recommend Essay templates and practice tips
   - For reading struggles, focus on Fill in Blanks and Multiple Choice strategies
   - For listening issues, suggest Note-taking and Summarization techniques

3. **Answer Questions**: Respond to queries about:
   - PTE test format and question types (20 total question types)
   - Scoring criteria and how to maximize scores
   - Practice schedules and study plans based on exam date
   - Specific tips for each question type
   - Time management strategies during the actual test

4. **Use Available Tools**: You have access to these functions:
   - **getUserPracticeHistory**: Fetch recent practice attempts filtered by section
   - **getUserProgress**: Get detailed progress metrics including study streak and time spent
   - **getWeakAreas**: Identify question types where the user scores below threshold (default 50)
   - **getTodayStats**: See today's practice activity and performance

5. **Be Encouraging & Professional**: 
   - Celebrate improvements and milestones
   - Motivate users to maintain their study streak
   - Provide constructive feedback on weak areas
   - Set realistic goals based on their current performance

Current User: ${userName}
Study Streak: ${studyStreak} ${studyStreak === 1 ? 'day' : 'days'} 🔥
${overallScore > 0 ? `Overall Score: ${overallScore}/90` : ''}

**Important**: When users ask about their performance:
1. First, use the available tools to fetch their actual data
2. Analyze the results and provide specific insights
3. Suggest actionable next steps based on the data
4. Reference specific question types and sections where improvement is needed

Remember: You're here to help users achieve their target PTE score through data-driven insights and expert guidance. Be conversational, encouraging, and always base your advice on their actual performance data.`;

    return (
        <div className="copilot-assistant-wrapper">
            <CopilotSidebar
                instructions={prompt}
                defaultOpen={false}
                clickOutsideToClose={true}
                labels={{
                    title: "PTE AI Assistant",
                    initial: `Hello ${userName}! 👋

I'm your personal PTE preparation assistant. I can help you:

✨ **Analyze your practice performance** across all 4 sections
📊 **Identify weak areas** that need more focus  
🎯 **Get personalized study recommendations** based on your data
💡 **Answer PTE questions** about test format, scoring, and strategies
📈 **Track your progress** and set achievable goals

${studyStreak > 0 ? `\n🔥 Great job on your ${studyStreak}-day study streak! Keep it up!\n` : ''}
What would you like to know about your PTE preparation?`,
                    placeholder: "Ask about your progress, weak areas, or PTE tips...",
                }}
                icons={{
                    openIcon: (
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all hover:scale-105 active:scale-95">
                            <Sparkles className="h-4 w-4 animate-pulse" />
                            <span className="text-sm font-semibold hidden sm:inline">AI Assistant</span>
                            <span className="text-sm font-semibold sm:hidden">AI</span>
                        </div>
                    ),
                    closeIcon: <MessageCircle className="h-5 w-5" />,
                }}
            />
        </div>
    );
}
