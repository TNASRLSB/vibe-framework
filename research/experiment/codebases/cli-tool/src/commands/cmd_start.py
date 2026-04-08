"""CMD-07: Start a task (move to in-progress)."""
from datetime import datetime
from store import TaskStore


def run(args):
    store = TaskStore()
    task = store.get_task(args.task_id)
    if not task:
        print(f"Task #{args.task_id} not found.")
        return
    # BUG-02: does not check if task is already in-progress or done
    store.update_task(args.task_id, status="in-progress", started=datetime.now().isoformat())
    print(f"Started task #{args.task_id}")
