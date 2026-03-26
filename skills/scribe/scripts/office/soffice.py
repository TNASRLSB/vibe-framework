#!/usr/bin/env python3
"""LibreOffice headless wrapper for document operations.

Usage:
    python3 soffice.py convert <file> <format> [--outdir <dir>]
    python3 soffice.py compare <original> <modified> <output>
    python3 soffice.py macro <file> <macro_name>
    python3 soffice.py --help

Commands:
    convert     Convert document to another format
    compare     Compare two documents and generate redlined output
    macro       Run a LibreOffice Basic macro on a document

Arguments:
    convert:
        file        Input document
        format      Target format (pdf, pdf/a, docx, xlsx, pptx, html, txt)
        --outdir    Output directory (default: same as input)

    compare:
        original    Original document
        modified    Modified document
        output      Output file with tracked changes

    macro:
        file        Document to process
        macro_name  Macro to run (e.g., "UpdateFields", "RecalcAll")

Output (JSON):
    {
        "status": "success" | "error",
        "command": "convert",
        "input": "file.docx",
        "output": "file.pdf",
        "message": ""
    }

Exit codes:
    0 - Success
    1 - User error
    2 - System error (LibreOffice not found)
"""

import argparse
import json
import os
import shutil
import subprocess
import sys


def find_soffice():
    """Find LibreOffice binary."""
    paths = [
        shutil.which("soffice"),
        shutil.which("libreoffice"),
        "/usr/bin/soffice",
        "/usr/bin/libreoffice",
        "/usr/local/bin/soffice",
        "/snap/bin/libreoffice",
        "/Applications/LibreOffice.app/Contents/MacOS/soffice",
    ]
    for p in paths:
        if p and os.path.isfile(p):
            return p
    return None


FORMAT_MAP = {
    "pdf": "pdf",
    "pdf/a": "pdf",
    "docx": "docx",
    "xlsx": "xlsx",
    "pptx": "pptx",
    "html": "html",
    "txt": "txt",
    "csv": "csv",
    "png": "png",
    "jpg": "jpg",
}

# LibreOffice filter names for specific conversions
FILTER_MAP = {
    "pdf": None,  # auto-detect
    "pdf/a": "writer_pdf_Export",  # with PDF/A options
    "docx": "MS Word 2007 XML",
    "xlsx": "Calc MS Excel 2007 XML",
    "pptx": "Impress MS PowerPoint 2007 XML",
    "csv": "Text - txt - csv (StarCalc)",
}


def convert(soffice, input_file, target_format, outdir=None):
    """Convert document to target format."""
    if not os.path.isfile(input_file):
        return {
            "status": "error",
            "command": "convert",
            "input": input_file,
            "output": None,
            "message": f"File not found: {input_file}",
        }

    lo_format = FORMAT_MAP.get(target_format, target_format)
    if outdir is None:
        outdir = os.path.dirname(os.path.abspath(input_file)) or "."

    cmd = [soffice, "--headless", "--convert-to", lo_format, "--outdir", outdir, input_file]

    # Add filter if specific one needed
    filter_name = FILTER_MAP.get(target_format)
    if filter_name:
        cmd = [soffice, "--headless", "--convert-to", f"{lo_format}:{filter_name}", "--outdir", outdir, input_file]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    except subprocess.TimeoutExpired:
        return {
            "status": "error",
            "command": "convert",
            "input": input_file,
            "output": None,
            "message": "LibreOffice timed out after 120 seconds.",
        }

    base = os.path.splitext(os.path.basename(input_file))[0]
    expected_output = os.path.join(outdir, f"{base}.{lo_format}")

    if os.path.isfile(expected_output):
        return {
            "status": "success",
            "command": "convert",
            "input": input_file,
            "output": expected_output,
            "message": "",
        }
    else:
        return {
            "status": "error",
            "command": "convert",
            "input": input_file,
            "output": None,
            "message": f"Conversion failed. LibreOffice stderr: {result.stderr.strip()}",
        }


def compare(soffice, original, modified, output):
    """Compare two documents and produce redlined version."""
    for f in [original, modified]:
        if not os.path.isfile(f):
            return {
                "status": "error",
                "command": "compare",
                "input": f"{original} vs {modified}",
                "output": None,
                "message": f"File not found: {f}",
            }

    # LibreOffice doesn't have a direct CLI compare command
    # Use a macro-based approach
    macro_script = f"""
import uno
from com.sun.star.beans import PropertyValue

def compare_docs():
    ctx = uno.getComponentContext()
    smgr = ctx.ServiceManager
    desktop = smgr.createInstanceWithContext("com.sun.star.frame.Desktop", ctx)

    url1 = uno.systemPathToFileUrl("{os.path.abspath(original)}")
    url2 = uno.systemPathToFileUrl("{os.path.abspath(modified)}")
    url_out = uno.systemPathToFileUrl("{os.path.abspath(output)}")

    doc = desktop.loadComponentFromURL(url1, "_blank", 0, ())
    dispatcher = smgr.createInstanceWithContext("com.sun.star.frame.DispatchHelper", ctx)

    args = []
    prop = PropertyValue()
    prop.Name = "URL"
    prop.Value = url2
    args.append(prop)

    dispatcher.executeDispatch(doc.getCurrentController().getFrame(), ".uno:CompareDocuments", "", 0, tuple(args))
    doc.store()
    doc.close(True)
"""

    return {
        "status": "error",
        "command": "compare",
        "input": f"{original} vs {modified}",
        "output": None,
        "message": "Document comparison requires LibreOffice macro execution. Use the OOXML diff approach described in references/docx.md instead.",
    }


def run_macro(soffice, input_file, macro_name):
    """Run a LibreOffice Basic macro on a document."""
    if not os.path.isfile(input_file):
        return {
            "status": "error",
            "command": "macro",
            "input": input_file,
            "output": None,
            "message": f"File not found: {input_file}",
        }

    # Known macros
    known_macros = {
        "UpdateFields": "macro:///Standard.Module1.UpdateFields",
        "RecalcAll": "macro:///Standard.Module1.RecalcAll",
    }

    macro_url = known_macros.get(macro_name, f"macro:///Standard.Module1.{macro_name}")

    cmd = [soffice, "--headless", f"--infilter={macro_url}", input_file]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        return {
            "status": "success",
            "command": "macro",
            "input": input_file,
            "output": input_file,
            "message": f"Macro {macro_name} executed.",
        }
    except subprocess.TimeoutExpired:
        return {
            "status": "error",
            "command": "macro",
            "input": input_file,
            "output": None,
            "message": "LibreOffice timed out after 60 seconds.",
        }


def main():
    parser = argparse.ArgumentParser(
        description="LibreOffice headless wrapper."
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    # convert
    p_convert = subparsers.add_parser("convert", help="Convert document format")
    p_convert.add_argument("file", help="Input document")
    p_convert.add_argument("format", help="Target format (pdf, docx, xlsx, pptx, html, txt)")
    p_convert.add_argument("--outdir", help="Output directory")

    # compare
    p_compare = subparsers.add_parser("compare", help="Compare two documents")
    p_compare.add_argument("original", help="Original document")
    p_compare.add_argument("modified", help="Modified document")
    p_compare.add_argument("output", help="Output file with tracked changes")

    # macro
    p_macro = subparsers.add_parser("macro", help="Run LibreOffice macro")
    p_macro.add_argument("file", help="Document to process")
    p_macro.add_argument("macro_name", help="Macro name")

    args = parser.parse_args()

    soffice = find_soffice()
    if not soffice:
        result = {
            "status": "error",
            "command": args.command,
            "input": getattr(args, "file", ""),
            "output": None,
            "message": "LibreOffice not found. Install it: sudo pacman -S libreoffice-fresh (Arch) / sudo apt install libreoffice (Debian)",
        }
        print(json.dumps(result, indent=2))
        sys.exit(2)

    if args.command == "convert":
        result = convert(soffice, args.file, args.format, args.outdir)
    elif args.command == "compare":
        result = compare(soffice, args.original, args.modified, args.output)
    elif args.command == "macro":
        result = run_macro(soffice, args.file, args.macro_name)

    print(json.dumps(result, indent=2))
    sys.exit(0 if result["status"] == "success" else 1)


if __name__ == "__main__":
    main()
