"use client";

import { useState } from "react";
import {
    BarChart3,
    BookOpen,
    CheckCircle,
    Clock,
    Target,
    TrendingDown,
    TrendingUp,
    XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface AnalyticsData {
    overallScore: number;
    bestScore: number;
    completedTests: number;
    skillData: {
        skill: string;
        current: number;
        previous: number;
        improvement: number;
    }[];
    history: {
        date: string;
        score: number;
    }[];
    recentTests: {
        title: string;
        date: string;
        score: number | string;
        sections: (number | "N/A")[];
    }[];
}

export function AnalyticsClient({ data }: { data: AnalyticsData }) {
    const [selectedPeriod, setSelectedPeriod] = useState<
        "week" | "month" | "quarter"
    >("month");

    const { overallScore, bestScore, completedTests, skillData, history, recentTests } = data;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Analytics & Performance</h1>
                    <p className="text-muted-foreground">
                        Detailed insights into your PTE preparation journey
                    </p>
                </div>
                <div className="flex gap-2">
                    {["week", "month", "quarter"].map((period) => (
                        <button
                            key={period}
                            className={`rounded-md px-3 py-1 text-sm ${selectedPeriod === period
                                    ? "bg-primary text-white"
                                    : "bg-gray-200"
                                }`}
                            onClick={() => setSelectedPeriod(period as any)}
                        >
                            {period.charAt(0).toUpperCase() + period.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                            Overall Score
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{overallScore}/90</div>
                        <div className="mt-2 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-500">+5 from last month</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Target className="h-5 w-5 text-blue-500" />
                            Best Score
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{bestScore}/90</div>
                        <div className="mt-2 text-sm text-gray-500">Personal record</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <BookOpen className="h-5 w-5 text-purple-500" />
                            Tests Completed
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{completedTests}</div>
                        <div className="mt-2 text-sm text-gray-500">
                            Practice makes perfect
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Skill Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Skill Breakdown</CardTitle>
                        <CardDescription>
                            Your performance across PTE sections
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {skillData.map((skill, index) => (
                                <div key={index}>
                                    <div className="mb-1 flex justify-between">
                                        <span className="font-medium">{skill.skill}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold">{skill.current}/90</span>
                                            <div className="flex items-center text-sm">
                                                {skill.improvement >= 0 ? (
                                                    <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                                                ) : (
                                                    <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
                                                )}
                                                <span
                                                    className={
                                                        skill.improvement >= 0
                                                            ? "text-green-500"
                                                            : "text-red-500"
                                                    }
                                                >
                                                    {skill.improvement >= 0 ? "+" : ""}
                                                    {skill.improvement}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Progress value={skill.current} className="h-3" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Score History */}
                <Card>
                    <CardHeader>
                        <CardTitle>Score History</CardTitle>
                        <CardDescription>Your scores over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {history.map((h, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="w-1/4 text-sm text-gray-500">{h.date}</div>
                                    <div className="w-2/4">
                                        <Progress value={h.score} className="h-2" />
                                    </div>
                                    <div className="w-1/4 text-right font-medium">
                                        {h.score}/90
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Mock Test Performance */}
            <Card>
                <CardHeader>
                    <CardTitle>Mock Test Performance</CardTitle>
                    <CardDescription>Your recent mock test results</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="py-2 text-left">Test Name</th>
                                    <th className="py-2 text-left">Date</th>
                                    <th className="py-2 text-left">Score</th>
                                    <th className="py-2 text-left">Speaking</th>
                                    <th className="py-2 text-left">Writing</th>
                                    <th className="py-2 text-left">Reading</th>
                                    <th className="py-2 text-left">Listening</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTests.map((test, index) => (
                                    <tr key={index} className="border-b">
                                        <td className="py-2">{test.title}</td>
                                        <td className="py-2">{test.date}</td>
                                        <td className="py-2 font-bold">{test.score}/90</td>
                                        <td className="py-2">{test.sections[0] || "N/A"}/90</td>
                                        <td className="py-2">{test.sections[1] || "N/A"}/90</td>
                                        <td className="py-2">{test.sections[2] || "N/A"}/90</td>
                                        <td className="py-2">{test.sections[3] || "N/A"}/90</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
