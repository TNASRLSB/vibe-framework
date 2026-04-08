"""CMD-04: Show task details."""
from store import TaskStore


def run(args):
    store = TaskStore()
    task = store.get_task(args.task_id)
    if not task:
        print(f"Task #{args.task_id} not found.")
        return
    print(f"Task #{task['id']}: {task['title']}")
    print(f"  Status:   {task['status']}")
    print(f"  Priority: {task['priority']}")
    print(f"  Due:      {task.get('due', 'none')}")
    print(f"  Tags:     {', '.join(task.get('tags', [])) or 'none'}")
    if args.verbose:
        print(f"  Created:  {task['created']}")
        print(f"  Started:  {task.get('started', 'n/a')}")
        print(f"  Done:     {task.get('completed', 'n/a')}")
