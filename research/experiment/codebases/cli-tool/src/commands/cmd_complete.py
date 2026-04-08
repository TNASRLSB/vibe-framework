"""CMD-09: Complete a task."""
from datetime import datetime
from store import TaskStore


def run(args):
    store = TaskStore()
    task = store.get_task(args.task_id)
    if not task:
        print(f"Task #{args.task_id} not found.")
        return
    updates = {"status": "done", "completed": datetime.now().isoformat()}
    if args.note:
        notes = task.get("notes", [])
        notes.append(f"Completed: {args.note}")
        updates["notes"] = notes
    store.update_task(args.task_id, **updates)
    print(f"Completed task #{args.task_id}")
