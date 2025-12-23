import { notFound } from 'next/navigation'
import MockTestSimulator, { MockTest } from '@/components/pte/mock-test-simulator'

// Simple mock data generator since we removed the complex lib/pte/mock-test-data
function getMockTest(id: string): MockTest | undefined {
  if (id !== 'mock-1') return undefined

  return {
    id: 'mock-1',
    title: 'PTE Academic Mock Test #1',
    duration: 180,
    sections: [
      {
        name: 'Speaking',
        questions: [
          { id: 's1', title: 'Read Aloud 1', type: 'Read Aloud', content: 'The atmosphere is a complex system...', duration: 40 },
          { id: 's2', title: 'Repeat Sentence 1', type: 'Repeat Sentence', content: 'Audio will play shortly.', duration: 15 }
        ]
      }
    ]
  }
}

export default async function MockTestPage({ params }: { params: { id: string } }) {
  const { id } = params
  const mockTest = getMockTest(id)

  if (!mockTest) {
    notFound()
  }

  return <MockTestSimulator mockTest={mockTest} />
}
