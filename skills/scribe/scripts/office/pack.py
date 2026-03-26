#!/usr/bin/env python3
"""Repackage an unpacked OOXML folder into a document.

Usage:
    python3 pack.py <folder> <output_file>
    python3 pack.py --help

Arguments:
    folder          Unpacked OOXML folder (from unpack.py)
    output_file     Output file path (.docx, .pptx, .xlsx)
    --validate      Run validation after packing (default: true)
    --no-validate   Skip validation
    --help, -h      Show this help message

Output (JSON):
    {
        "status": "success" | "error",
        "input": "folder/",
        "output": "file.docx",
        "files_packed": 42,
        "validation": {"valid": true, "errors": [], "warnings": []},
        "message": ""
    }

Exit codes:
    0 - Success
    1 - User error (folder not found, invalid structure)
    2 - System error (packing failure)
"""

import argparse
import json
import os
import sys
import zipfile


# OOXML requires specific file ordering and compression
CONTENT_TYPES_FILE = "[Content_Types].xml"
RELS_DIR = "_rels"


def pack(input_dir, output_file, validate=True):
    """Pack folder into OOXML file."""
    if not os.path.isdir(input_dir):
        return {
            "status": "error",
            "input": input_dir,
            "output": None,
            "files_packed": 0,
            "validation": None,
            "message": f"Folder not found: {input_dir}",
        }

    # Check for [Content_Types].xml
    ct_path = os.path.join(input_dir, CONTENT_TYPES_FILE)
    if not os.path.isfile(ct_path):
        return {
            "status": "error",
            "input": input_dir,
            "output": None,
            "files_packed": 0,
            "validation": None,
            "message": f"Invalid OOXML structure: missing {CONTENT_TYPES_FILE}",
        }

    try:
        files_packed = 0

        with zipfile.ZipFile(output_file, "w", zipfile.ZIP_DEFLATED) as zf:
            # [Content_Types].xml must be first
            zf.write(ct_path, CONTENT_TYPES_FILE)
            files_packed += 1

            # _rels/ should be early
            rels_path = os.path.join(input_dir, RELS_DIR)
            if os.path.isdir(rels_path):
                for root, dirs, files in os.walk(rels_path):
                    for f in files:
                        full_path = os.path.join(root, f)
                        arc_name = os.path.relpath(full_path, input_dir)
                        zf.write(full_path, arc_name)
                        files_packed += 1

            # Everything else
            for root, dirs, files in os.walk(input_dir):
                for f in files:
                    if f == ".scribe_meta":
                        continue
                    full_path = os.path.join(root, f)
                    arc_name = os.path.relpath(full_path, input_dir)

                    # Skip already-added files
                    if arc_name == CONTENT_TYPES_FILE:
                        continue
                    if arc_name.startswith(RELS_DIR + os.sep) or arc_name.startswith(RELS_DIR + "/"):
                        continue

                    zf.write(full_path, arc_name)
                    files_packed += 1

        validation_result = None
        if validate:
            # Run validate.py on the output
            validate_script = os.path.join(os.path.dirname(__file__), "validate.py")
            if os.path.isfile(validate_script):
                import subprocess
                result = subprocess.run(
                    [sys.executable, validate_script, output_file],
                    capture_output=True, text=True, timeout=30
                )
                try:
                    validation_result = json.loads(result.stdout)
                except (json.JSONDecodeError, ValueError):
                    validation_result = {"valid": None, "errors": [], "warnings": ["Validation script output not parseable"]}

        return {
            "status": "success",
            "input": input_dir,
            "output": output_file,
            "files_packed": files_packed,
            "validation": validation_result,
            "message": "",
        }

    except Exception as e:
        return {
            "status": "error",
            "input": input_dir,
            "output": None,
            "files_packed": 0,
            "validation": None,
            "message": f"Packing failed: {str(e)}",
        }


def main():
    parser = argparse.ArgumentParser(
        description="Repackage unpacked OOXML folder into document."
    )
    parser.add_argument("folder", help="Unpacked OOXML folder")
    parser.add_argument("output", help="Output file (.docx, .pptx, .xlsx)")
    parser.add_argument("--no-validate", action="store_true", help="Skip validation after packing")

    args = parser.parse_args()
    result = pack(args.folder, args.output, validate=not args.no_validate)

    print(json.dumps(result, indent=2))
    sys.exit(0 if result["status"] == "success" else 1)


if __name__ == "__main__":
    main()
