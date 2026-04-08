"""CMD-02: Add a new task."""
from store import TaskStore


def run(args):
    store = TaskStore()
    task = store.add_task(args.title, priority=args.priority, due=args.due, tags=args.tags)
    print(f"Added task #{task['id']}: {task['title']}")
