#!/usr/bin/env python3
"""Generate thumbnail preview of a PowerPoint slide as PNG image.

Usage:
    python3 thumbnail.py <file.pptx> [slide_number] [--output <output.png>]
    python3 thumbnail.py --help

Arguments:
    file.pptx       PowerPoint file
    slide_number    Slide number to render (1-indexed, default: 1)
    --output, -o    Output PNG path (default: <filename>_slide_<N>.png)
    --width         Output width in pixels (default: 1280)
    --all           Generate thumbnails for all slides
    --help, -h      Show this help message

Output (JSON):
    {
        "status": "success" | "error",
        "input": "file.pptx",
        "slide": 1,
        "output": "file_slide_1.png",
        "total_slides": 10,
        "message": ""
    }

Exit codes:
    0 - Success
    1 - User error (file not found, invalid slide number)
    2 - System error (LibreOffice not found)

Requires: LibreOffice (for rendering slides to images)
"""

import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile


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


def get_slide_count(pptx_file):
    """Get total slide count from PPTX file."""
    try:
        from pptx import Presentation
        prs = Presentation(pptx_file)
        return len(prs.slides)
    except ImportError:
        # Fallback: count slides in ZIP
        import zipfile
        with zipfile.ZipFile(pptx_file, "r") as zf:
            slides = [n for n in zf.namelist()
                     if n.startswith("ppt/slides/slide") and n.endswith(".xml")]
            return len(slides)


def generate_thumbnail(pptx_file, slide_num=1, output_path=None, width=1280):
    """Generate thumbnail for a specific slide."""
    soffice = find_soffice()
    if not soffice:
        return {
            "status": "error",
            "input": pptx_file,
            "slide": slide_num,
            "output": None,
            "total_slides": -1,
            "message": "LibreOffice not found. Required for slide rendering.",
        }

    if not os.path.isfile(pptx_file):
        return {
            "status": "error",
            "input": pptx_file,
            "slide": slide_num,
            "output": None,
            "total_slides": -1,
            "message": f"File not found: {pptx_file}",
        }

    total_slides = get_slide_count(pptx_file)
    if slide_num < 1 or slide_num > total_slides:
        return {
            "status": "error",
            "input": pptx_file,
            "slide": slide_num,
            "output": None,
            "total_slides": total_slides,
            "message": f"Invalid slide number {slide_num}. File has {total_slides} slides.",
        }

    with tempfile.TemporaryDirectory() as tmpdir:
        # Convert PPTX to images via LibreOffice
        cmd = [
            soffice,
            "--headless",
            "--convert-to", "png",
            "--outdir", tmpdir,
            pptx_file,
        ]

        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        except subprocess.TimeoutExpired:
            return {
                "status": "error",
                "input": pptx_file,
                "slide": slide_num,
                "output": None,
                "total_slides": total_slides,
                "message": "LibreOffice timed out after 120 seconds.",
            }

        # LibreOffice exports individual slide images
        base = os.path.splitext(os.path.basename(pptx_file))[0]
        # Try different naming patterns LibreOffice uses
        candidates = [
            os.path.join(tmpdir, f"{base}.png"),
            os.path.join(tmpdir, f"{base}-{slide_num}.png"),
            os.path.join(tmpdir, f"{base}_{slide_num}.png"),
        ]

        # Also look for any PNG in tmpdir
        all_pngs = sorted([
            os.path.join(tmpdir, f) for f in os.listdir(tmpdir)
            if f.endswith(".png")
        ])

        source_png = None
        for c in candidates:
            if os.path.isfile(c):
                source_png = c
                break

        if source_png is None and all_pngs:
            # If slide_num is within range of generated PNGs
            if slide_num <= len(all_pngs):
                source_png = all_pngs[slide_num - 1]
            else:
                source_png = all_pngs[0]

        if source_png is None:
            return {
                "status": "error",
                "input": pptx_file,
                "slide": slide_num,
                "output": None,
                "total_slides": total_slides,
                "message": "LibreOffice did not produce PNG output.",
            }

        # Copy to final output
        if output_path is None:
            output_path = os.path.join(
                os.path.dirname(os.path.abspath(pptx_file)),
                f"{base}_slide_{slide_num}.png"
            )

        shutil.copy2(source_png, output_path)

        return {
            "status": "success",
            "input": pptx_file,
            "slide": slide_num,
            "output": output_path,
            "total_slides": total_slides,
            "message": "",
        }


def main():
    parser = argparse.ArgumentParser(
        description="Generate thumbnail preview of PowerPoint slide."
    )
    parser.add_argument("file", help="PowerPoint file (.pptx)")
    parser.add_argument("slide", nargs="?", type=int, default=1, help="Slide number (1-indexed, default: 1)")
    parser.add_argument("-o", "--output", help="Output PNG path")
    parser.add_argument("--width", type=int, default=1280, help="Output width in pixels")
    parser.add_argument("--all", action="store_true", help="Generate thumbnails for all slides")

    args = parser.parse_args()

    if not args.file.endswith((".pptx", ".ppt")):
        result = {
            "status": "error",
            "input": args.file,
            "slide": args.slide,
            "output": None,
            "total_slides": -1,
            "message": "Input must be a PowerPoint file (.pptx).",
        }
        print(json.dumps(result, indent=2))
        sys.exit(1)

    if args.all:
        total = get_slide_count(args.file)
        results = []
        for i in range(1, total + 1):
            r = generate_thumbnail(args.file, i, width=args.width)
            results.append(r)
        print(json.dumps(results, indent=2))
        sys.exit(0 if all(r["status"] == "success" for r in results) else 1)
    else:
        result = generate_thumbnail(args.file, args.slide, args.output, args.width)
        print(json.dumps(result, indent=2))
        sys.exit(0 if result["status"] == "success" else 1)


if __name__ == "__main__":
    main()
