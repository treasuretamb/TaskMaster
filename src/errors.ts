// Custom error thrown when a task ID doesn't exist in the task list.
export class TaskNotFoundError extends Error {
  constructor(id: number) {
    super(`Task with id ${id} not found.`);
    this.name = "TaskNotFoundError";
  }
}