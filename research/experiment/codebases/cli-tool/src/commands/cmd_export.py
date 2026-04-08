"""CMD-13: Export tasks."""
import json
import csv
import sys
from store import TaskStore


def run(args):
    store = TaskStore()
    tasks = store.list_tasks()

    output = sys.stdout
    if args.output:
        output = open(args.output, "w")

    if args.format == "json":
        json.dump(tasks, output, indent=2)
    elif args.format == "csv":
        writer = csv.writer(output)
        writer.writerow(["id", "title", "status", "priority", "due", "tags"])
        for t in tasks:
            writer.writerow([t["id"], t["title"], t["status"], t["priority"],
                             t.get("due", ""), ",".join(t.get("tags", []))])
    elif args.format == "markdown":
        output.write("# Tasks\n\n")
        for t in tasks:
            status_mark = "x" if t["status"] == "done" else " "
            output.write(f"- [{status_mark}] {t['title']} ({t['priority']})\n")

    if args.output:
        output.close()
        print(f"Exported {len(tasks)} task(s) to {args.output}")
    # BUG-04: if writing to stdout with json/csv, no newline at end
