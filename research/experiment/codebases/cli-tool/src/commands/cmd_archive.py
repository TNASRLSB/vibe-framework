"""CMD-10: Archive completed tasks."""
from store import TaskStore


def run(args):
    store = TaskStore()
    tasks = store.list_tasks(status="done")
    if args.before:
        tasks = [t for t in tasks if t.get("completed", "") < args.before]
    if not args.all and not args.before:
        # BUG-03: if neither --all nor --before, archives nothing silently
        print("Use --all or --before to specify which tasks to archive.")
        return
    count = 0
    for t in tasks:
        store.update_task(t["id"], status="archived")
        count += 1
    print(f"Archived {count} task(s).")
