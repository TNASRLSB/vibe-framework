"""CMD-03: List tasks."""
from store import TaskStore


def run(args):
    store = TaskStore()
    tasks = store.list_tasks(
        status=args.status,
        priority=args.priority,
        sort=args.sort,
        reverse=args.reverse
    )
    if not tasks:
        print("No tasks found.")
        return
    for t in tasks:
        status_icon = {"todo": " ", "in-progress": ">", "done": "x", "archived": "-"}
        icon = status_icon.get(t["status"], "?")
        priority_mark = {"high": "!!!", "medium": "!!", "low": "!"}
        prio = priority_mark.get(t["priority"], "")
        print(f"  [{icon}] #{t['id']} {t['title']} {prio}")
