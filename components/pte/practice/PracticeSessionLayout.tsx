'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { PTELayoutClient } from '@/components/pte/pte-layout-client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, BookOpen, PenTool, Mic, Headphones } from 'lucide-react'
import { cn } from '@/lib/utils'

type PracticeType = 'speaking' | 'writing' | 'reading' | 'listening'

interface PracticeSessionLayoutProps {
  children: ReactNode
  questionId: string
  questionType: string
  section: PracticeType
  title: string
  difficulty?: string
  onBack?: () => void
  showBackButton?: boolean
}

export function PracticeSessionLayout({
  children,
  questionId,
  questionType,
  section,
  title,
  difficulty = 'Medium',
  onBack,
  showBackButton = true
}: PracticeSessionLayoutProps) {
  const router = useRouter()

  const getSectionIcon = () => {
    switch (section) {
      case 'speaking': return Mic
      case 'writing': return PenTool
      case 'reading': return BookOpen
      case 'listening': return Headphones
      default: return BookOpen
    }
  }

  const Icon = getSectionIcon()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  return (
    <PTELayoutClient>
      <div className="max-w-5xl mx-auto space-y-6 p-4 md:p-6">
        {/* Header with breadcrumbs */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleBack}
                className="h-9 w-9"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex items-center gap-2">
              <div className={cn(
                "p-2 rounded-lg",
                section === 'speaking' ? 'bg-blue-100 text-blue-600' :
                section === 'writing' ? 'bg-green-100 text-green-600' :
                section === 'reading' ? 'bg-purple-100 text-purple-600' :
                'bg-orange-100 text-orange-600'
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-bold text-lg">{title}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="capitalize">{section}</span>
                  <span>•</span>
                  <Badge variant="secondary" className="capitalize">
                    {difficulty}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </PTELayoutClient>
  )
}