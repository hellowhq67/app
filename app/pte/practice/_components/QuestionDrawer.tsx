'use client'

import React from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Circle, PlayCircle, Search, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Question {
  id: string
  title: string
  difficulty: string
  practiced?: boolean
}

interface QuestionDrawerProps {
  isOpen: boolean
  onClose: (open: boolean) => void
  questions: Question[]
  currentQuestionId?: string
  categoryCode: string
  typeCode: string
}

export function QuestionDrawer({
  isOpen,
  onClose,
  questions,
  currentQuestionId,
  categoryCode,
  typeCode
}: QuestionDrawerProps) {
  const router = useRouter()
  const [search, setSearch] = React.useState('')

  const filteredQuestions = questions.filter(q => 
    q.title.toLowerCase().includes(search.toLowerCase())
  )

  const handleQuestionClick = (questionId: string) => {
    // Navigate to the new PTE practice route
    router.push(`/pte/practice/${categoryCode}/${typeCode}/${questionId}`)
    onClose(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[380px] sm:w-[450px] p-0 flex flex-col gap-0 border-l border-border/40">
        <SheetHeader className="p-8 border-b border-border/40 bg-card/50 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <PlayCircle className="size-24" />
            </div>
          <SheetTitle className="text-2xl font-black flex items-center gap-3 relative z-10">
            Practice List
          </SheetTitle>
          <div className="flex items-center gap-2 relative z-10">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-black text-[10px] uppercase tracking-widest">
                {questions.length} Tasks
            </Badge>
            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-50">
                • {categoryCode.replace('_', ' ')}
            </span>
          </div>
        </SheetHeader>

        <div className="p-4 border-b border-border/40 bg-background/50">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input 
                    placeholder="Search tasks..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 h-12 rounded-2xl bg-muted/30 border-none focus-visible:ring-1 ring-primary/20 font-medium"
                />
            </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {filteredQuestions.map((q, index) => (
              <button
                key={q.id}
                onClick={() => handleQuestionClick(q.id)}
                className={cn(
                  "w-full text-left p-5 rounded-[24px] transition-all flex items-start gap-4 group relative overflow-hidden",
                  currentQuestionId === q.id 
                    ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20" 
                    : "hover:bg-muted/80 text-foreground/70 hover:text-foreground"
                )}
              >
                <div className="mt-1 shrink-0">
                  {q.practiced ? (
                    <CheckCircle className={cn(
                        "w-4 h-4",
                        currentQuestionId === q.id ? "text-primary-foreground" : "text-emerald-500"
                    )} />
                  ) : (
                    <div className={cn(
                        "size-4 rounded-full border-2 transition-colors",
                        currentQuestionId === q.id 
                            ? "border-primary-foreground/40" 
                            : "border-muted-foreground/20 group-hover:border-primary/40"
                    )} />
                  )}
                </div>
                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest opacity-50",
                        currentQuestionId === q.id ? "text-primary-foreground" : ""
                    )}>
                      Task {index + 1}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-[9px] px-2 py-0 h-4 uppercase font-black border-none",
                        currentQuestionId === q.id 
                            ? "bg-white/20 text-white" 
                            : q.difficulty === 'Easy' ? "bg-emerald-500/10 text-emerald-600" :
                              q.difficulty === 'Medium' ? "bg-amber-500/10 text-amber-600" :
                              "bg-rose-500/10 text-rose-600"
                      )}
                    >
                      {q.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm font-black leading-tight truncate">
                    {q.title}
                  </p>
                </div>
              </button>
            ))}

            {filteredQuestions.length === 0 && (
                <div className="py-12 text-center space-y-3">
                    <div className="size-12 rounded-full bg-muted mx-auto flex items-center justify-center">
                        <Filter className="size-5 text-muted-foreground opacity-30" />
                    </div>
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">No matching tasks</p>
                </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-6 border-t border-border/40 bg-card/30">
            <Button variant="outline" className="w-full rounded-2xl h-12 font-black text-xs uppercase tracking-widest border-border/60">
                Refresh Questions
            </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
