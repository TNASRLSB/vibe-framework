#!/bin/bash
# AudioSculpt Text2midi Engine Setup
# Downloads model weights from HuggingFace on first use (like Playwright downloads Chromium)
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== AudioSculpt Text2midi Setup ==="

# Install Python dependencies
echo "[1/2] Installing Python dependencies..."
pip install -r "$SCRIPT_DIR/requirements.txt" --quiet

# Download model from HuggingFace
echo "[2/2] Downloading Text2midi model from HuggingFace..."
python3 -c "
from huggingface_hub import snapshot_download
path = snapshot_download('amaai-lab/text2midi', cache_dir=None)
print(f'Model downloaded to: {path}')
print('Text2midi ready.')
"

echo "=== Setup complete ==="
