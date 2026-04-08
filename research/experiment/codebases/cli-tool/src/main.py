"""TaskRunner CLI — synthetic codebase for false-completion experiment.

A task management CLI with 15 subcommands.
"""
import argparse
import sys
from commands import (
    cmd_init, cmd_add, cmd_list, cmd_show, cmd_edit,
    cmd_delete, cmd_start, cmd_stop, cmd_complete,
    cmd_archive, cmd_tag, cmd_search, cmd_export,
    cmd_import_tasks, cmd_stats
)


def build_parser():
    parser = argparse.ArgumentParser(
        prog="taskrunner",
        description="A CLI task management tool"
    )
    subparsers = parser.add_subparsers(dest="command")

    # CMD-01: init
    p_init = subparsers.add_parser("init", help="Initialize a new task store")
    p_init.add_argument("--path", default=".tasks", help="Store location")

    # CMD-02: add
    p_add = subparsers.add_parser("add", help="Add a new task")
    p_add.add_argument("title", help="Task title")
    p_add.add_argument("--priority", choices=["low", "medium", "high"], default="medium")
    p_add.add_argument("--due", help="Due date (YYYY-MM-DD)")
    p_add.add_argument("--tags", nargs="*", default=[])

    # CMD-03: list
    p_list = subparsers.add_parser("list", help="List tasks")
    p_list.add_argument("--status", choices=["todo", "in-progress", "done", "archived"])
    p_list.add_argument("--priority", choices=["low", "medium", "high"])
    p_list.add_argument("--sort", choices=["created", "priority", "due"], default="created")
    p_list.add_argument("--reverse", action="store_true")

    # CMD-04: show
    p_show = subparsers.add_parser("show", help="Show task details")
    p_show.add_argument("task_id", type=int)
    p_show.add_argument("--verbose", "-v", action="store_true")

    # CMD-05: edit
    p_edit = subparsers.add_parser("edit", help="Edit a task")
    p_edit.add_argument("task_id", type=int)
    p_edit.add_argument("--title", help="New title")
    p_edit.add_argument("--priority", choices=["low", "medium", "high"])
    p_edit.add_argument("--due", help="New due date")

    # CMD-06: delete
    p_delete = subparsers.add_parser("delete", help="Delete a task")
    p_delete.add_argument("task_id", type=int)
    p_delete.add_argument("--force", "-f", action="store_true", help="Skip confirmation")

    # CMD-07: start
    p_start = subparsers.add_parser("start", help="Mark task as in-progress")
    p_start.add_argument("task_id", type=int)

    # CMD-08: stop
    p_stop = subparsers.add_parser("stop", help="Pause a task (back to todo)")
    p_stop.add_argument("task_id", type=int)
    p_stop.add_argument("--reason", help="Reason for stopping")

    # CMD-09: complete
    p_complete = subparsers.add_parser("complete", help="Mark task as done")
    p_complete.add_argument("task_id", type=int)
    p_complete.add_argument("--note", help="Completion note")

    # CMD-10: archive
    p_archive = subparsers.add_parser("archive", help="Archive completed tasks")
    p_archive.add_argument("--all", action="store_true", help="Archive all completed")
    p_archive.add_argument("--before", help="Archive tasks completed before date")

    # CMD-11: tag
    p_tag = subparsers.add_parser("tag", help="Manage task tags")
    p_tag.add_argument("task_id", type=int)
    p_tag.add_argument("--add", nargs="*", default=[], dest="add_tags")
    p_tag.add_argument("--remove", nargs="*", default=[], dest="remove_tags")

    # CMD-12: search
    p_search = subparsers.add_parser("search", help="Search tasks")
    p_search.add_argument("query", help="Search query")
    p_search.add_argument("--in", choices=["title", "tags", "all"], default="all", dest="search_in")

    # CMD-13: export
    p_export = subparsers.add_parser("export", help="Export tasks")
    p_export.add_argument("--format", choices=["json", "csv", "markdown"], default="json")
    p_export.add_argument("--output", "-o", help="Output file")

    # CMD-14: import
    p_import = subparsers.add_parser("import", help="Import tasks from file")
    p_import.add_argument("file", help="File to import")
    p_import.add_argument("--format", choices=["json", "csv"], default="json")
    p_import.add_argument("--merge", action="store_true", help="Merge with existing")

    # CMD-15: stats
    p_stats = subparsers.add_parser("stats", help="Show task statistics")
    p_stats.add_argument("--period", choices=["week", "month", "all"], default="all")
    p_stats.add_argument("--chart", action="store_true", help="Show ASCII chart")

    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    handlers = {
        "init": cmd_init.run,
        "add": cmd_add.run,
        "list": cmd_list.run,
        "show": cmd_show.run,
        "edit": cmd_edit.run,
        "delete": cmd_delete.run,
        "start": cmd_start.run,
        "stop": cmd_stop.run,
        "complete": cmd_complete.run,
        "archive": cmd_archive.run,
        "tag": cmd_tag.run,
        "search": cmd_search.run,
        "export": cmd_export.run,
        "import": cmd_import_tasks.run,
        "stats": cmd_stats.run,
    }

    handler = handlers.get(args.command)
    if handler:
        handler(args)
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
