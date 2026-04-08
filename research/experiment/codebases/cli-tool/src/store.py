"""Task storage layer with JSON file backend."""
import json
import os
from datetime import datetime


class TaskStore:
    def __init__(self, path=".tasks"):
        self.path = path
        self.file = os.path.join(path, "tasks.json")

    def initialize(self):
        os.makedirs(self.path, exist_ok=True)
        if not os.path.exists(self.file):
            self._write({"tasks": [], "next_id": 1, "created": datetime.now().isoformat()})

    def _read(self):
        with open(self.file, "r") as f:
            return json.load(f)

    def _write(self, data):
        with open(self.file, "w") as f:
            json.dump(data, f, indent=2)

    def add_task(self, title, priority="medium", due=None, tags=None):
        data = self._read()
        task = {
            "id": data["next_id"],
            "title": title,
            "priority": priority,
            "status": "todo",
            "due": due,
            "tags": tags or [],
            "created": datetime.now().isoformat(),
            "started": None,
            "completed": None,
            "notes": [],
        }
        data["tasks"].append(task)
        data["next_id"] += 1
        self._write(data)
        return task

    def get_task(self, task_id):
        data = self._read()
        for t in data["tasks"]:
            if t["id"] == task_id:
                return t
        return None

    def update_task(self, task_id, **kwargs):
        data = self._read()
        for t in data["tasks"]:
            if t["id"] == task_id:
                t.update(kwargs)
                self._write(data)
                return t
        return None

    def delete_task(self, task_id):
        data = self._read()
        data["tasks"] = [t for t in data["tasks"] if t["id"] != task_id]
        self._write(data)

    def list_tasks(self, status=None, priority=None, sort="created", reverse=False):
        data = self._read()
        tasks = data["tasks"]
        if status:
            tasks = [t for t in tasks if t["status"] == status]
        if priority:
            tasks = [t for t in tasks if t["priority"] == priority]
        priority_order = {"high": 0, "medium": 1, "low": 2}
        if sort == "priority":
            tasks.sort(key=lambda t: priority_order.get(t["priority"], 1), reverse=reverse)
        elif sort == "due":
            tasks.sort(key=lambda t: t.get("due") or "9999-99-99", reverse=reverse)
        else:
            tasks.sort(key=lambda t: t["created"], reverse=reverse)
        return tasks

    def search_tasks(self, query, search_in="all"):
        data = self._read()
        results = []
        query_lower = query.lower()
        for t in data["tasks"]:
            if search_in in ("title", "all") and query_lower in t["title"].lower():
                results.append(t)
            elif search_in in ("tags", "all") and any(query_lower in tag.lower() for tag in t.get("tags", [])):
                if t not in results:
                    results.append(t)
        return results

    def get_stats(self, period="all"):
        data = self._read()
        tasks = data["tasks"]
        return {
            "total": len(tasks),
            "todo": sum(1 for t in tasks if t["status"] == "todo"),
            "in_progress": sum(1 for t in tasks if t["status"] == "in-progress"),
            "done": sum(1 for t in tasks if t["status"] == "done"),
            "archived": sum(1 for t in tasks if t["status"] == "archived"),
            "by_priority": {
                "high": sum(1 for t in tasks if t["priority"] == "high"),
                "medium": sum(1 for t in tasks if t["priority"] == "medium"),
                "low": sum(1 for t in tasks if t["priority"] == "low"),
            }
        }
