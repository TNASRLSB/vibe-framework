"""CMD-05: Edit a task."""
from store import TaskStore


def run(args):
    store = TaskStore()
    updates = {}
    if args.title:
        updates["title"] = args.title
    if args.priority:
        updates["priority"] = args.priority
    if args.due:
        updates["due"] = args.due
    if not updates:
        print("Nothing to update. Use --title, --priority, or --due.")
        return
    task = store.update_task(args.task_id, **updates)
    if task:
        print(f"Updated task #{task['id']}")
    else:
        print(f"Task #{args.task_id} not found.")
