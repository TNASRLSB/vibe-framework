#!/usr/bin/env python3
"""Extract OOXML document into an editable folder.

Usage:
    python3 unpack.py <file.docx|pptx|xlsx> [--output <folder>]
    python3 unpack.py --help

Arguments:
    file            OOXML file to unpack (.docx, .pptx, .xlsx)
    --output, -o    Output folder (default: <filename>_unpacked/)
    --help, -h      Show this help message

Output (JSON):
    {
        "status": "success" | "error",
        "input": "file.docx",
        "output": "file_unpacked/",
        "files_extracted": 42,
        "message": ""
    }

Exit codes:
    0 - Success
    1 - User error (file not found, invalid format)
    2 - System error (extraction failure)
"""

import argparse
import json
import os
import sys
import zipfile


VALID_EXTENSIONS = (".docx", ".pptx", ".xlsx")


def unpack(input_file, output_dir=None):
    """Unpack OOXML file into folder."""
    if not os.path.isfile(input_file):
        return {
            "status": "error",
            "input": input_file,
            "output": None,
            "files_extracted": 0,
            "message": f"File not found: {input_file}",
        }

    ext = os.path.splitext(input_file)[1].lower()
    if ext not in VALID_EXTENSIONS:
        return {
            "status": "error",
            "input": input_file,
            "output": None,
            "files_extracted": 0,
            "message": f"Invalid format: {ext}. Expected: {', '.join(VALID_EXTENSIONS)}",
        }

    if output_dir is None:
        base = os.path.splitext(input_file)[0]
        output_dir = f"{base}_unpacked"

    try:
        os.makedirs(output_dir, exist_ok=True)

        with zipfile.ZipFile(input_file, "r") as zf:
            zf.extractall(output_dir)
            files_extracted = len(zf.namelist())

        # Save original extension for repacking
        meta_file = os.path.join(output_dir, ".scribe_meta")
        with open(meta_file, "w") as f:
            json.dump({
                "original_file": os.path.basename(input_file),
                "extension": ext,
                "files_extracted": files_extracted,
            }, f, indent=2)

        return {
            "status": "success",
            "input": input_file,
            "output": output_dir,
            "files_extracted": files_extracted,
            "message": "",
        }

    except zipfile.BadZipFile:
        return {
            "status": "error",
            "input": input_file,
            "output": None,
            "files_extracted": 0,
            "message": f"Invalid OOXML file (not a valid zip): {input_file}",
        }
    except Exception as e:
        return {
            "status": "error",
            "input": input_file,
            "output": None,
            "files_extracted": 0,
            "message": f"Extraction failed: {str(e)}",
        }


def main():
    parser = argparse.ArgumentParser(
        description="Extract OOXML document into editable folder."
    )
    parser.add_argument("file", help="OOXML file (.docx, .pptx, .xlsx)")
    parser.add_argument("-o", "--output", help="Output folder path")

    args = parser.parse_args()
    result = unpack(args.file, args.output)

    print(json.dumps(result, indent=2))
    sys.exit(0 if result["status"] == "success" else 1)


if __name__ == "__main__":
    main()
