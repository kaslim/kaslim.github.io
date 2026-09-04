#!/usr/bin/env python3
"""Fetch the audited GACELA source and maestro-short checkpoint."""

from __future__ import annotations

import hashlib
import shutil
import subprocess
import urllib.request
import zipfile

from config import (
    CACHE,
    CHECKPOINT,
    CHECKPOINT_ARCHIVE,
    CHECKPOINT_ARCHIVE_MD5,
    CHECKPOINT_SHA256,
    CHECKPOINT_URL,
    GACELA_COMMIT,
    GACELA_REPOSITORY,
    GACELA_SOURCE,
)


def digest(path, algorithm: str) -> str:
    hasher = hashlib.new(algorithm)
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            hasher.update(block)
    return hasher.hexdigest()


def fetch(url: str, target) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    request = urllib.request.Request(url, headers={"User-Agent": "MAIA-repro/1.0"})
    with urllib.request.urlopen(request, timeout=180) as source, target.open("wb") as sink:
        shutil.copyfileobj(source, sink)


def ensure_source() -> None:
    if not (GACELA_SOURCE / ".git").exists():
        GACELA_SOURCE.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run(
            ["git", "clone", GACELA_REPOSITORY, str(GACELA_SOURCE)],
            check=True,
        )
    subprocess.run(
        ["git", "-C", str(GACELA_SOURCE), "fetch", "origin", GACELA_COMMIT],
        check=True,
    )
    subprocess.run(
        ["git", "-C", str(GACELA_SOURCE), "checkout", "--detach", GACELA_COMMIT],
        check=True,
    )


def ensure_checkpoint() -> None:
    if not CHECKPOINT_ARCHIVE.exists() or digest(CHECKPOINT_ARCHIVE, "md5") != CHECKPOINT_ARCHIVE_MD5:
        fetch(CHECKPOINT_URL, CHECKPOINT_ARCHIVE)
    archive_md5 = digest(CHECKPOINT_ARCHIVE, "md5")
    if archive_md5 != CHECKPOINT_ARCHIVE_MD5:
        raise RuntimeError(f"Checkpoint archive checksum mismatch: {archive_md5}")

    if not CHECKPOINT.exists():
        CHECKPOINT.parent.parent.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(CHECKPOINT_ARCHIVE) as archive:
            archive.extractall(CHECKPOINT.parent.parent)

    checkpoint_sha = digest(CHECKPOINT, "sha256")
    if checkpoint_sha != CHECKPOINT_SHA256:
        raise RuntimeError(f"Checkpoint checksum mismatch: {checkpoint_sha}")


def main() -> None:
    CACHE.mkdir(parents=True, exist_ok=True)
    ensure_source()
    ensure_checkpoint()
    print(f"GACELA source: {GACELA_SOURCE} @ {GACELA_COMMIT}")
    print(f"Checkpoint: {CHECKPOINT}")
    print(f"Checkpoint SHA-256: {CHECKPOINT_SHA256}")


if __name__ == "__main__":
    main()
