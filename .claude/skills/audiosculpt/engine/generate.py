#!/usr/bin/env python3
"""
AudioSculpt Text2midi Generator
Generates MIDI from text prompt using the Text2midi model.

Usage:
    python generate.py --prompt "dark electronic, A minor, 122 BPM, 4/4" --output /tmp/soundtrack.mid
    python generate.py --prompt "..." --output /tmp/out.mid --temperature 1.0 --max-length 1024
"""

import argparse
import sys
import os

def check_dependencies():
    """Verify all required packages are installed."""
    missing = []
    for pkg in ["torch", "transformers", "miditok", "symusic", "huggingface_hub"]:
        try:
            __import__(pkg)
        except ImportError:
            missing.append(pkg)
    if missing:
        print(f"Missing dependencies: {', '.join(missing)}", file=sys.stderr)
        print(f"Run: bash {os.path.dirname(__file__)}/setup.sh", file=sys.stderr)
        sys.exit(1)

def load_model():
    """Load Text2midi model and tokenizer from HuggingFace cache."""
    import torch
    from huggingface_hub import snapshot_download
    from transformers import AutoTokenizer

    model_path = snapshot_download("amaai-lab/text2midi")

    # Detect device
    if torch.cuda.is_available():
        device = torch.device("cuda")
    elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
        device = torch.device("mps")
    else:
        device = torch.device("cpu")
        print("Warning: Running on CPU. Generation will be slow.", file=sys.stderr)

    # Load model components
    # Note: Text2midi uses a custom architecture. The exact loading depends on
    # the repository structure. This wrapper adapts to the repo's inference API.
    sys.path.insert(0, model_path)

    try:
        # Try the repo's own inference module
        from model import Text2MidiModel
        model = Text2MidiModel.from_pretrained(model_path).to(device)
        tokenizer = AutoTokenizer.from_pretrained(model_path)
        return model, tokenizer, device
    except ImportError:
        pass

    try:
        # Alternative: use generate.py from the repo itself
        from inference import generate_midi
        return generate_midi, model_path, device
    except ImportError:
        pass

    # Fallback: load as a standard HF model
    from transformers import AutoModelForCausalLM
    model = AutoModelForCausalLM.from_pretrained(model_path, torch_dtype=torch.float16).to(device)
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    return model, tokenizer, device


def generate(prompt: str, output_path: str, temperature: float = 1.0, max_length: int = 1024):
    """Generate a MIDI file from a text prompt."""
    import torch

    model, tokenizer, device = load_model()

    # If the repo provides its own generate function
    if callable(model) and not hasattr(model, "generate"):
        model(prompt=prompt, output=output_path, temperature=temperature)
        print(f"MIDI written to: {output_path}")
        return

    # Standard HF generation
    inputs = tokenizer(prompt, return_tensors="pt").to(device)

    with torch.no_grad():
        output_ids = model.generate(
            **inputs,
            max_new_tokens=max_length,
            temperature=temperature,
            do_sample=True,
            top_p=0.95,
        )

    # Decode tokens to MIDI using miditok
    from miditok import REMI
    midi_tokenizer = REMI()

    # Remove prompt tokens from output
    generated_ids = output_ids[0][inputs["input_ids"].shape[1]:]
    tokens = tokenizer.decode(generated_ids, skip_special_tokens=True)

    # Convert token string to MIDI
    midi = midi_tokenizer.tokens_to_midi([tokens.split()])
    midi.dump_midi(output_path)
    print(f"MIDI written to: {output_path}")


def main():
    parser = argparse.ArgumentParser(description="Generate MIDI from text prompt")
    parser.add_argument("--prompt", required=True, help="Text description of the music")
    parser.add_argument("--output", required=True, help="Output .mid file path")
    parser.add_argument("--temperature", type=float, default=1.0, help="Sampling temperature (default: 1.0)")
    parser.add_argument("--max-length", type=int, default=1024, help="Max token length (default: 1024)")
    args = parser.parse_args()

    check_dependencies()
    generate(args.prompt, args.output, args.temperature, args.max_length)


if __name__ == "__main__":
    main()
