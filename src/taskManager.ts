import { promises as fs } from "fs";
import { Task } from "./task";
import { TaskNotFoundError } from "./errors";

// Manages a list of tasks, including nested subtasks, persistence, and reporting.
export class TaskManager {
  tasks: Task[] = [];
  private nextId = 1;

  // Adds a new task. If parentId is given, adds it as a subtask of that task.
  addTask(title: string, parentId?: number): Task {
    const task = new Task(this.nextId++, title);
    if (parentId === undefined) {
      this.tasks.push(task);
    } else {
      const parent = this.findTask(parentId);
      if (!parent) throw new TaskNotFoundError(parentId);
      parent.subtasks.push(task);
    }
    return task;
  }

  // Recursively searches the task tree (including subtasks) for a task by id.
  findTask(id: number, list: Task[] = this.tasks): Task | undefined {
    for (const task of list) {
      if (task.id === id) return task;
      const found = this.findTask(id, task.subtasks);
      if (found) return found;
    }
    return undefined;
  }

  completeTask(id: number): void {
    const task = this.findTask(id);
    if (!task) throw new TaskNotFoundError(id);
    task.done = true;
  }

  // Removes a task (searching recursively) from wherever it lives in the tree.
  removeTask(id: number, list: Task[] = this.tasks): boolean {
    const index = list.findIndex((t) => t.id === id);
    if (index !== -1) {
      list.splice(index, 1);
      return true;
    }
    for (const task of list) {
      if (this.removeTask(id, task.subtasks)) return true;
    }
    if (list === this.tasks) throw new TaskNotFoundError(id);
    return false;
  }

  // Recursively prints tasks as an indented tree to the terminal.
  printTasks(list: Task[] = this.tasks, depth = 0): void {
    for (const task of list) {
      const mark = task.done ? "[x]" : "[ ]";
      console.log(`${"  ".repeat(depth)}${mark} ${task.id}. ${task.title}`);
      this.printTasks(task.subtasks, depth + 1);
    }
  }

  // Recursively counts completed vs. pending tasks across all subtask levels.
  countStatus(list: Task[] = this.tasks): { completed: number; pending: number } {
    let completed = 0;
    let pending = 0;
    for (const task of list) {
      if (task.done) completed++;
      else pending++;
      const sub = this.countStatus(task.subtasks);
      completed += sub.completed;
      pending += sub.pending;
    }
    return { completed, pending };
  }

  // Saves the current task list to a JSON file.
  async save(filepath: string): Promise<void> {
    await fs.writeFile(filepath, JSON.stringify(this.tasks, null, 2), "utf-8");
  }

  // Loads a task list from a JSON file, replacing the current tasks.
  async load(filepath: string): Promise<void> {
    const data = await fs.readFile(filepath, "utf-8");
    this.tasks = JSON.parse(data);
        this.nextId = this.computeMaxId(this.tasks) + 1;
  }

   private computeMaxId(list: Task[]): number {
    let max = 0;
    for (const task of list) {
      max = Math.max(max, task.id, this.computeMaxId(task.subtasks));
    }
    return max;
  }
}
