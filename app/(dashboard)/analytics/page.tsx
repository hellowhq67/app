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
import { generateMockTestData, MockTest } from '@/lib/pte/mock-test-data'

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<
    'week' | 'month' | 'quarter'
  >('month')
  const mockTests = generateMockTestData()

  // Calculate overall stats
  const completedTests = mockTests.filter(
    (t) => t.status === 'completed' || t.status === 'reviewed'
  ).length

  const scoreValue = (t: MockTest) => {
    const s: any = t.score as any
    return typeof s === 'number'
      ? s
      : typeof s?.overall === 'number'
        ? s.overall
        : 0
  }
  const scored = mockTests.map(scoreValue)
  const avgScore =
    scored.length > 0
      ? Math.round(scored.reduce((acc, curr) => acc + curr, 0) / scored.length)
      : 0
  const bestScore = scored.length > 0 ? Math.max(...scored) : 0

  // Mock historical data for charts
  const scoreTrendData = [
    { date: 'Jan 1', score: 65 },
    { date: 'Jan 8', score: 68 },
    { date: 'Jan 15', score: 72 },
    { date: 'Jan 22', score: 74 },
    { date: 'Jan 29', score: 78 },
    { date: 'Feb 5', score: 80 },
  ]

  // Mock skill data
  const skillData = [
    { skill: 'Speaking', current: 75, previous: 68, improvement: 7 },
    { skill: 'Writing', current: 82, previous: 79, improvement: 3 },
    { skill: 'Reading', current: 85, previous: 82, improvement: 3 },
    { skill: 'Listening', current: 80, previous: 75, improvement: 5 },
  ]

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
                              ? 'text-green-500'
                              : 'text-red-500'
                          }
                        >
                          {skill.improvement >= 0 ? '+' : ''}
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
              {scoreTrendData.map((data, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="w-1/4 text-sm text-gray-500">{data.date}</div>
                  <div className="w-2/4">
                    <Progress value={data.score} className="h-2" />
                  </div>
                  <div className="w-1/4 text-right font-medium">
                    {data.score}/90
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Section Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Section Analysis</CardTitle>
          <CardDescription>
            Detailed breakdown of each PTE section
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
                    <span className="font-bold">75/90</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Accuracy</span>
                    <span>78%</span>
                  </div>
                  <div className="mt-2 text-sm">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Fluency: Good</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>Pronunciation: Needs work</span>
                    </div>
                  </div>
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
                    <span className="font-bold">82/90</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Accuracy</span>
                    <span>85%</span>
                  </div>
                  <div className="mt-2 text-sm">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Grammar: Excellent</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Vocabulary: Good</span>
                    </div>
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
                    <span className="font-bold">85/90</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Accuracy</span>
                    <span>90%</span>
                  </div>
                  <div className="mt-2 text-sm">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Skimming: Excellent</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Scanning: Excellent</span>
                    </div>
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
                    <span className="font-bold">80/90</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Accuracy</span>
                    <span>83%</span>
                  </div>
                  <div className="mt-2 text-sm">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Overall: Good</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>Note-taking: Improve</span>
                    </div>
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
                    <td className="py-2">{test.title}</td>
                    <td className="py-2">{test.date}</td>
                    <td className="py-2 font-bold">{scoreValue(test)}/90</td>
                    <td className="py-2">
                      {test.sections[0]?.score || 'N/A'}/90
                    </td>
                    <td className="py-2">
                      {test.sections[1]?.score || 'N/A'}/90
                    </td>
                    <td className="py-2">
                      {test.sections[2]?.score || 'N/A'}/90
                    </td>
                    <td className="py-2">
                      {test.sections[3]?.score || 'N/A'}/90
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
