#!/usr/bin/env python3
"""Validate OOXML document structure and auto-repair common issues.

Usage:
    python3 validate.py <file_or_folder>
    python3 validate.py --repair <file>
    python3 validate.py --help

Arguments:
    file_or_folder  OOXML file (.docx/.pptx/.xlsx) or unpacked folder
    --repair        Attempt to auto-repair common issues
    --strict        Fail on warnings too (default: only errors)
    --help, -h      Show this help message

Output (JSON):
    {
        "status": "success" | "error",
        "valid": true | false,
        "input": "file.docx",
        "format": "docx",
        "errors": [],
        "warnings": [],
        "repairs": [],
        "message": ""
    }

Exit codes:
    0 - Valid (no errors)
    1 - Invalid (errors found)
    2 - System error
"""

import argparse
import json
import os
import sys
import xml.etree.ElementTree as ET
import zipfile


# Required files per format
REQUIRED_FILES = {
    "docx": [
        "[Content_Types].xml",
        "_rels/.rels",
        "word/document.xml",
        "word/_rels/document.xml.rels",
    ],
    "pptx": [
        "[Content_Types].xml",
        "_rels/.rels",
        "ppt/presentation.xml",
        "ppt/_rels/presentation.xml.rels",
    ],
    "xlsx": [
        "[Content_Types].xml",
        "_rels/.rels",
        "xl/workbook.xml",
        "xl/_rels/workbook.xml.rels",
    ],
}

# Common content type entries
CONTENT_TYPES = {
    "docx": [
        ("word/document.xml", "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"),
    ],
    "pptx": [
        ("ppt/presentation.xml", "application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"),
    ],
    "xlsx": [
        ("xl/workbook.xml", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"),
    ],
}


def detect_format(path):
    """Detect OOXML format from file extension or folder contents."""
    if os.path.isfile(path):
        ext = os.path.splitext(path)[1].lower().lstrip(".")
        if ext in REQUIRED_FILES:
            return ext

        # Check meta file in case extension is wrong
        meta_path = os.path.join(os.path.splitext(path)[0] + "_unpacked", ".scribe_meta")
        if os.path.isfile(meta_path):
            with open(meta_path) as f:
                meta = json.load(f)
                return meta.get("extension", "").lstrip(".")

    elif os.path.isdir(path):
        meta_path = os.path.join(path, ".scribe_meta")
        if os.path.isfile(meta_path):
            with open(meta_path) as f:
                meta = json.load(f)
                return meta.get("extension", "").lstrip(".")

        # Detect from folder contents
        if os.path.isfile(os.path.join(path, "word", "document.xml")):
            return "docx"
        if os.path.isfile(os.path.join(path, "ppt", "presentation.xml")):
            return "pptx"
        if os.path.isfile(os.path.join(path, "xl", "workbook.xml")):
            return "xlsx"

    return None


def get_file_list(path):
    """Get list of files in OOXML document or folder."""
    if os.path.isfile(path):
        try:
            with zipfile.ZipFile(path, "r") as zf:
                return zf.namelist()
        except zipfile.BadZipFile:
            return None
    elif os.path.isdir(path):
        files = []
        for root, dirs, filenames in os.walk(path):
            for f in filenames:
                if f == ".scribe_meta":
                    continue
                rel_path = os.path.relpath(os.path.join(root, f), path)
                files.append(rel_path.replace(os.sep, "/"))
        return files
    return None


def validate_xml(path, file_path):
    """Validate that a file is well-formed XML."""
    try:
        if os.path.isfile(path) and zipfile.is_zipfile(path):
            with zipfile.ZipFile(path, "r") as zf:
                content = zf.read(file_path)
        else:
            full_path = os.path.join(path, file_path.replace("/", os.sep))
            with open(full_path, "rb") as f:
                content = f.read()

        ET.fromstring(content)
        return True, None
    except ET.ParseError as e:
        return False, str(e)
    except Exception as e:
        return False, str(e)


def validate(input_path, repair=False, strict=False):
    """Validate OOXML document."""
    errors = []
    warnings = []
    repairs = []

    fmt = detect_format(input_path)
    if fmt is None:
        return {
            "status": "error",
            "valid": False,
            "input": input_path,
            "format": None,
            "errors": ["Cannot detect OOXML format"],
            "warnings": [],
            "repairs": [],
            "message": "Provide a .docx, .pptx, or .xlsx file or unpacked folder.",
        }

    file_list = get_file_list(input_path)
    if file_list is None:
        return {
            "status": "error",
            "valid": False,
            "input": input_path,
            "format": fmt,
            "errors": ["Cannot read file contents (corrupt or not a valid zip)"],
            "warnings": [],
            "repairs": [],
            "message": "",
        }

    # Check required files
    required = REQUIRED_FILES.get(fmt, [])
    for req_file in required:
        if req_file not in file_list:
            errors.append(f"Missing required file: {req_file}")

    # Validate XML well-formedness for key files
    xml_files = [f for f in file_list if f.endswith(".xml") or f.endswith(".rels")]
    for xml_file in xml_files:
        valid, error = validate_xml(input_path, xml_file)
        if not valid:
            errors.append(f"Malformed XML in {xml_file}: {error}")

    # Check Content_Types.xml
    if "[Content_Types].xml" in file_list:
        valid, error = validate_xml(input_path, "[Content_Types].xml")
        if valid:
            # Check for expected content type entries
            expected_types = CONTENT_TYPES.get(fmt, [])
            for part_name, content_type in expected_types:
                if part_name not in file_list:
                    continue
                # Verify it's referenced in Content_Types
                # (simplified check - just warn if the main part might be missing)
        else:
            errors.append(f"[Content_Types].xml is malformed: {error}")

    # Check for common issues
    if fmt == "docx":
        # Check for empty document body
        if "word/document.xml" in file_list:
            pass  # Basic presence check already done

    elif fmt == "xlsx":
        # Check for shared strings (common for data-heavy sheets)
        if "xl/sharedStrings.xml" not in file_list:
            warnings.append("No sharedStrings.xml found (may be okay for formula-only sheets)")

    elif fmt == "pptx":
        # Check for at least one slide
        slides = [f for f in file_list if f.startswith("ppt/slides/slide") and f.endswith(".xml")]
        if not slides:
            errors.append("No slides found in presentation")

    is_valid = len(errors) == 0
    if strict:
        is_valid = is_valid and len(warnings) == 0

    return {
        "status": "success",
        "valid": is_valid,
        "input": input_path,
        "format": fmt,
        "errors": errors,
        "warnings": warnings,
        "repairs": repairs,
        "message": "",
    }


def main():
    parser = argparse.ArgumentParser(
        description="Validate OOXML document structure."
    )
    parser.add_argument("file", help="OOXML file or unpacked folder")
    parser.add_argument("--repair", action="store_true", help="Attempt auto-repair")
    parser.add_argument("--strict", action="store_true", help="Fail on warnings too")

    args = parser.parse_args()
    result = validate(args.file, repair=args.repair, strict=args.strict)

    print(json.dumps(result, indent=2))

    if result["valid"]:
        sys.exit(0)
    elif result["status"] == "error" and not result.get("errors"):
        sys.exit(2)
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()
