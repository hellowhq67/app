'use client'

import { useState } from 'react'
import {
    BarChart3,
    BookOpen,
    CheckCircle,
    Clock,
    Target,
    TrendingDown,
    TrendingUp,
    XCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { PteMockTest } from '@/lib/db/schema'
import { format } from 'date-fns'

interface AnalyticsDashboardProps {
    mockTests: PteMockTest[]
}

export function AnalyticsDashboard({ mockTests }: AnalyticsDashboardProps) {
    const [selectedPeriod, setSelectedPeriod] = useState<
        'week' | 'month' | 'quarter'
    >('month')

    // Helper to get consistent score
    const getScore = (test: PteMockTest) => test.overallScore || 0

    // Calculate overall stats
    const completedTests = mockTests.filter(
        (t) => t.status === 'completed'
    ).length

    const scoredTests = mockTests.filter(t => t.status === 'completed' && t.overallScore !== null)
    const scores = scoredTests.map(t => t.overallScore || 0)

    const avgScore =
        scores.length > 0
            ? Math.round(scores.reduce((acc, curr) => acc + curr, 0) / scores.length)
            : 0

    const bestScore = scores.length > 0 ? Math.max(...scores) : 0

    // Mock historical data for charts - in real app, group mockTests by date
    // For now, let's map the actual tests to trend data
    const scoreTrendData = scoredTests
        .sort((a, b) => (new Date(a.completedAt || 0).getTime() - new Date(b.completedAt || 0).getTime()))
        .map(t => ({
            date: t.completedAt ? format(new Date(t.completedAt), 'MMM d') : 'N/A',
            score: t.overallScore || 0
        }))
        .slice(-10) // Last 10 tests

    // Calculate skill averages
    const skillAvg = (key: 'speakingScore' | 'writingScore' | 'readingScore' | 'listeningScore') => {
        const valid = scoredTests.filter(t => t[key] !== null)
        if (valid.length === 0) return 0
        return Math.round(valid.reduce((acc, curr) => acc + (curr[key] || 0), 0) / valid.length)
    }

    const skillData = [
        { skill: 'Speaking', current: skillAvg('speakingScore'), previous: 0, improvement: 0 },
        { skill: 'Writing', current: skillAvg('writingScore'), previous: 0, improvement: 0 },
        { skill: 'Reading', current: skillAvg('readingScore'), previous: 0, improvement: 0 },
        { skill: 'Listening', current: skillAvg('listeningScore'), previous: 0, improvement: 0 },
    ]

    // Calculate simple improvement based on last 2 tests if available
    if (scoredTests.length >= 2) {
        const last = scoredTests[scoredTests.length - 1]
        const prev = scoredTests[scoredTests.length - 2]

        skillData[0].previous = prev.speakingScore || 0
        skillData[0].improvement = (last.speakingScore || 0) - (prev.speakingScore || 0)

        skillData[1].previous = prev.writingScore || 0
        skillData[1].improvement = (last.writingScore || 0) - (prev.writingScore || 0)

        skillData[2].previous = prev.readingScore || 0
        skillData[2].improvement = (last.readingScore || 0) - (prev.readingScore || 0)

        skillData[3].previous = prev.listeningScore || 0
        skillData[3].improvement = (last.listeningScore || 0) - (prev.listeningScore || 0)
    }

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
                    <button
                        className={`rounded-md px-3 py-1 text-sm ${selectedPeriod === 'week' ? 'bg-primary text-white' : 'bg-gray-200'}`}
                        onClick={() => setSelectedPeriod('week')}
                    >
                        Week
                    </button>
                    <button
                        className={`rounded-md px-3 py-1 text-sm ${selectedPeriod === 'month' ? 'bg-primary text-white' : 'bg-gray-200'}`}
                        onClick={() => setSelectedPeriod('month')}
                    >
                        Month
                    </button>
                    <button
                        className={`rounded-md px-3 py-1 text-sm ${selectedPeriod === 'quarter' ? 'bg-primary text-white' : 'bg-gray-200'}`}
                        onClick={() => setSelectedPeriod('quarter')}
                    >
                        Quarter
                    </button>
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
                        <div className="text-3xl font-bold">{avgScore}/90</div>
                        {/* distinct trend calc omitted for brevity, can enable if history exists */}
                        <div className="mt-2 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-500">Average of {scoredTests.length} tests</span>
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
                            Your average performance across PTE sections
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
                                            {skill.improvement !== 0 && (
                                                <div className="flex items-center text-sm">
                                                    {skill.improvement >= 0 ? (
                                                        <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
                                                    )}
                                                    <span
                                                        className={
                                                            skill.improvement >= 0
                                                                ? 'text-green-500'
                                                                : 'text-red-500'
                                                        }
                                                    >
                                                        {skill.improvement >= 0 ? '+' : ''}
                                                        {skill.improvement}
                                                    </span>
                                                </div>
                                            )}
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
                            {scoreTrendData.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">No completed tests yet</div>
                            ) : (
                                scoreTrendData.map((data, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="w-1/4 text-sm text-gray-500">{data.date}</div>
                                        <div className="w-2/4">
                                            <Progress value={data.score} className="h-2" />
                                        </div>
                                        <div className="w-1/4 text-right font-medium">
                                            {data.score}/90
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Section Analysis */}
            <Card>
                <CardHeader>
                    <CardTitle>Section Analysis</CardTitle>
                    <CardDescription>
                        Detailed breakdown of average score for each PTE section
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {/* Speaking Analysis */}
                        <Card className="border-2 border-blue-200">
                            <CardHeader>
                                <CardTitle className="text-lg">Speaking</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Score</span>
                                        <span className="font-bold">{skillAvg('speakingScore')}/90</span>
                                    </div>
                                    {/* Accuracy or other detailed metrics would require deeper aggregation */}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Writing Analysis */}
                        <Card className="border-2 border-green-200">
                            <CardHeader>
                                <CardTitle className="text-lg">Writing</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Score</span>
                                        <span className="font-bold">{skillAvg('writingScore')}/90</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Reading Analysis */}
                        <Card className="border-2 border-yellow-200">
                            <CardHeader>
                                <CardTitle className="text-lg">Reading</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Score</span>
                                        <span className="font-bold">{skillAvg('readingScore')}/90</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Listening Analysis */}
                        <Card className="border-2 border-purple-200">
                            <CardHeader>
                                <CardTitle className="text-lg">Listening</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Score</span>
                                        <span className="font-bold">{skillAvg('listeningScore')}/90</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>

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
                                {mockTests.map((test, index) => (
                                    <tr key={index} className="border-b">
                                        <td className="py-2">{test.testName}</td>
                                        <td className="py-2">{test.completedAt ? format(new Date(test.completedAt), 'MMM d, yyyy') : 'N/A'}</td>
                                        <td className="py-2 font-bold">{test.overallScore || 'N/A'}/90</td>
                                        <td className="py-2">
                                            {test.speakingScore || 'N/A'}/90
                                        </td>
                                        <td className="py-2">
                                            {test.writingScore || 'N/A'}/90
                                        </td>
                                        <td className="py-2">
                                            {test.readingScore || 'N/A'}/90
                                        </td>
                                        <td className="py-2">
                                            {test.listeningScore || 'N/A'}/90
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
