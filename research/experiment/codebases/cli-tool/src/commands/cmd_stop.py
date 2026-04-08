"""CMD-08: Stop a task (back to todo)."""
from store import TaskStore


def run(args):
    store = TaskStore()
    task = store.get_task(args.task_id)
    if not task:
        print(f"Task #{args.task_id} not found.")
        return
    updates = {"status": "todo"}
    if args.reason:
        notes = task.get("notes", [])
        notes.append(f"Stopped: {args.reason}")
        updates["notes"] = notes
    store.update_task(args.task_id, **updates)
    print(f"Stopped task #{args.task_id}")
