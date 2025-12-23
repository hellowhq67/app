'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Play, CheckCircle } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function PracticeTablePage() {
  const params = useParams()
  const { section, type } = params as { section: string; type: string }

  // Mock data - In real app, fetch from API based on type
  const questions = Array.from({ length: 10 }).map((_, i) => ({
    id: `${type}-${i + 1}`,
    title: `${type.replace(/_/g, ' ')} Question ${i + 1}`,
    difficulty: i % 3 === 0 ? 'Hard' : i % 2 === 0 ? 'Medium' : 'Easy',
    status: i < 3 ? 'completed' : 'new',
    score: i < 3 ? Math.floor(Math.random() * 90) : null
  }))

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/pte/practice-new">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold capitalize">{type.replace(/_/g, ' ')}</h1>
          <p className="text-muted-foreground capitalize">{section} Practice</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question Library</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="font-medium">{q.title}</TableCell>
                  <TableCell>
                    <Badge variant={q.difficulty === 'Hard' ? 'destructive' : 'secondary'}>
                      {q.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {q.status === 'completed' ? (
                      <Badge className="bg-green-500 hover:bg-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" /> Done
                      </Badge>
                    ) : (
                      <Badge variant="outline">New</Badge>
                    )}
                  </TableCell>
                  <TableCell>{q.score ? `${q.score}/90` : '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm">
                      <Link href={`/pte/practice-new/${section}/${type}/${q.id}`}>
                        <Play className="w-3 h-3 mr-2" />
                        Practice
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}