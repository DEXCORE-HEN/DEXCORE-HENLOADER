#!/usr/bin/env python3
"""Verify selected DEXCORE payload and firmware patch without running the exploit."""
import hashlib
import json
from pathlib import Path
root = Path(__file__).resolve().parent.parent
manifest = json.loads((root / "builds/release.json").read_text())
for key in ("payload", "kernel_patch"):
    if key == "payload":
        path = root / manifest["default_payload"]
        length = manifest["payload_size_bytes"]
        digest = manifest["payload_sha256"]
    else:
        path = root / manifest["kernel_patch"]
        length = manifest["kernel_patch_size_bytes"]
        digest = manifest["kernel_patch_sha256"]
    data = path.read_bytes()
    assert len(data) == length, f"{key} size mismatch"
    assert hashlib.sha256(data).hexdigest() == digest, f"{key} SHA-256 mismatch"
    print(f"OK {key}: {len(data)} bytes sha256={digest}")
print("Integrity checks passed; this does not validate PS4 runtime behavior.")
