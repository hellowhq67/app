export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  modules: CourseModule[];
  progress: number;
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: CourseLesson[];
}

export interface CourseLesson {
  id: string;
  title: string;
  duration: number;
  completed: boolean;
}
