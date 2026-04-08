"""CMD-06: Delete a task."""
from store import TaskStore


def run(args):
    store = TaskStore()
    task = store.get_task(args.task_id)
    if not task:
        print(f"Task #{args.task_id} not found.")
        return
    if not args.force:
        # BUG-01: confirmation prompt uses input() which hangs in non-interactive
        confirm = input(f"Delete task #{args.task_id} '{task['title']}'? [y/N] ")
        if confirm.lower() != "y":
            print("Cancelled.")
            return
    store.delete_task(args.task_id)
    print(f"Deleted task #{args.task_id}")
