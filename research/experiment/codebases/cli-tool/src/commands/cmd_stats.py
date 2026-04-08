"""CMD-15: Show task statistics."""
from store import TaskStore


def run(args):
    store = TaskStore()
    stats = store.get_stats(period=args.period)

    print("Task Statistics")
    print(f"  Total:       {stats['total']}")
    print(f"  Todo:        {stats['todo']}")
    print(f"  In Progress: {stats['in_progress']}")
    print(f"  Done:        {stats['done']}")
    print(f"  Archived:    {stats['archived']}")
    print(f"\nBy Priority:")
    print(f"  High:   {stats['by_priority']['high']}")
    print(f"  Medium: {stats['by_priority']['medium']}")
    print(f"  Low:    {stats['by_priority']['low']}")

    if args.chart:
        # BUG-06: chart flag accepted but not implemented
        print("\n(chart not yet implemented)")
