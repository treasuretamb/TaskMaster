import { TaskManager } from "./taskManager";
import { TaskNotFoundError } from "./errors";

const DATA_FILE = "./data/tasks.json";

async function main(): Promise<void> {
    const manager = new TaskManager();

    // Load existing tasks if the data file exists; otherwise start fresh.
    try {
        await manager.load(DATA_FILE);
    } catch {
        console.log("No existing task data found. Starting fresh.");
    }

    const [command, ...args] = process.argv.slice(2);

    try {
        switch (command) {
            case "add": {
                const parentIndex = args.indexOf("--parent");
                let parentId: number | undefined;
                let titleArgs = args;
                if (parentIndex !== -1) {
                parentId = Number(args[parentIndex + 1]);
                titleArgs = args.slice(0, parentIndex);
                }
                const title = titleArgs.join(" ");
                const task = manager.addTask(title, parentId);
                console.log(`Added task ${task.id}: "${task.title}"`);
                break;
            }
            case "complete": {
                const id = Number(args[0]);
                manager.completeTask(id);
                console.log(`Marked task ${id} as complete.`);
                break;
            }
            case "remove": {
                const id = Number(args[0]);
                manager.removeTask(id);
                console.log(`Removed task ${id}.`);
                break;
            }
            case "list": {
                console.log("Tasks:");
                manager.printTasks();
                break;
            }
            case "stats": {
                const { completed, pending } = manager.countStatus();
                console.log(`Completed: ${completed}, Pending: ${pending}`);
                break;
            }
            default:
                console.log("Usage: npm start -- <add|complete|remove|list|stats> [args]");
        }
        await manager.save(DATA_FILE);
    } catch (err) {
        if (err instanceof TaskNotFoundError) {
            console.error(`Error: ${err.message}`);
        } else {
            throw err;
        }
    }
}

main();