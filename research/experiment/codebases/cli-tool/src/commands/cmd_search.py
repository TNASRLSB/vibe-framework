"""CMD-12: Search tasks."""
from store import TaskStore


def run(args):
    store = TaskStore()
    results = store.search_tasks(args.query, search_in=args.search_in)
    if not results:
        print("No matching tasks.")
        return
    for t in results:
        print(f"  #{t['id']} {t['title']} [{t['status']}]")
    print(f"\n{len(results)} result(s) found.")
