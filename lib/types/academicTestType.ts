export interface AcademicTest {
  id: string;
  title: string;
  description: string;
  duration: number;
  questionCount: number;
  type: 'mock' | 'practice' | 'diagnostic';
}
