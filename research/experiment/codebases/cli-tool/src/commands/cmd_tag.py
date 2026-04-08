"""CMD-11: Manage task tags."""
from store import TaskStore


def run(args):
    store = TaskStore()
    task = store.get_task(args.task_id)
    if not task:
        print(f"Task #{args.task_id} not found.")
        return
    tags = set(task.get("tags", []))
    for t in args.add_tags:
        tags.add(t)
    for t in args.remove_tags:
        tags.discard(t)
    store.update_task(args.task_id, tags=list(tags))
    print(f"Tags for #{args.task_id}: {', '.join(sorted(tags)) or 'none'}")
