// Represents a single task, which may contain nested subtasks.
export class Task {
  id: number;
  title: string;
  done: boolean;
  subtasks: Task[];

  constructor(id: number, title: string) {
    this.id = id;
    this.title = title;
    this.done = false;
    this.subtasks = [];
  }
}