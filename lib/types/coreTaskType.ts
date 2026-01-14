export interface CoreTask {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
}
