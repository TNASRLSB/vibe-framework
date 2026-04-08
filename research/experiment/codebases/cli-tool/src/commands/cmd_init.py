"""CMD-01: Initialize task store."""
from store import TaskStore


def run(args):
    store = TaskStore(args.path)
    store.initialize()
    print(f"Initialized task store at {args.path}")
