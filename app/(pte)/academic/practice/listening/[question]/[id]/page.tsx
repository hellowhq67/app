export const dynamic = 'force-dynamic';

import React from 'react'
import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'
import { getQuestionById, getUserPracticeStatus } from '@/lib/pte/practice'
import { AccessGate } from '@/components/pte/AccessGate'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Clock, BarChart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ListeningPracticeClient } from '@/components/pte/listening/ListeningPracticeClient'

export default async function ListeningQuestionPage({ params }: { params: Promise<{ question: string, id: string }> }) {
  const { question, id } = await params
  // 1. Get Session
  const session = await auth.api.getSession({
    headers: await headers()
  })

  // 2. Fetch Data
  const questionData = await getQuestionById(id)
  if (!questionData) {
    notFound()
  }

  // 3. Fetch User Status for Gate
  let userTier: 'free' | 'basic' | 'premium' | 'unlimited' = 'free'
  if (session?.user?.id) {
    const userStatus = await getUserPracticeStatus(session.user.id)
    if (userStatus?.subscriptionTier) {
      userTier = userStatus.subscriptionTier
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6">
      {/* Header / Nav */}
      <div className="flex items-center justify-between">
        <Link href={`/academic/practice/listening`}>
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
            <ArrowLeft className="size-4" /> Back to list
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          {questionData.isPremium && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 gap-1">
              Premium
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">{questionData.title}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Clock className="size-3" /> 10 mins
              </span>
              <span className="flex items-center gap-1">
                <BarChart className="size-3" /> {questionData.difficulty || 'Medium'}
              </span>
            </p>
          </div>

          <AccessGate isPremium={questionData.isPremium} userTier={userTier}>
            <div className="bg-white dark:bg-[#1e1e20] border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-sm min-h-[400px]">
              {/* Question Content */}
              <div className="prose dark:prose-invert max-w-none mb-8">
                <h3 className="text-lg font-semibold mb-2">Instructions</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {questionData.content}
                </p>
              </div>

              {/* Practice UI Area */}
              <ListeningPracticeClient
                questionId={questionData.id}
                questionType={questionData.questionType?.code || questionData.questionTypeId}
                content={questionData.content || ''}
                audioUrl={questionData.audioUrl || undefined}
                transcript={'listening' in questionData ? questionData.listening?.transcript || undefined : undefined}
                options={'listening' in questionData ? questionData.listening?.options?.choices || [] : []}
                timeLimit={600}
              />
            </div>
          </AccessGate>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-6 border border-blue-100 dark:border-blue-900/20">
            <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">Listening Tips</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
              Focus on keywords and the overall meaning. Do not try to write down every single word.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
