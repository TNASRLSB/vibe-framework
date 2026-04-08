"""CMD-14: Import tasks from file."""
import json
import csv
from store import TaskStore


def run(args):
    store = TaskStore()

    if args.format == "json":
        with open(args.file, "r") as f:
            tasks = json.load(f)
    elif args.format == "csv":
        tasks = []
        with open(args.file, "r") as f:
            reader = csv.DictReader(f)
            for row in reader:
                tasks.append({
                    "title": row["title"],
                    "priority": row.get("priority", "medium"),
                    "due": row.get("due"),
                    "tags": row.get("tags", "").split(",") if row.get("tags") else [],
                })
    else:
        print(f"Unsupported format: {args.format}")
        return

    count = 0
    for t in tasks:
        # BUG-05: merge flag is accepted but has no effect — always creates new
        store.add_task(t["title"], priority=t.get("priority", "medium"),
                       due=t.get("due"), tags=t.get("tags", []))
        count += 1
    print(f"Imported {count} task(s).")
