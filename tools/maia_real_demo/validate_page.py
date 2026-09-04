#!/usr/bin/env python3
"""Static integrity checks for the rebuilt MAIA research page."""

from __future__ import annotations

import hashlib
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[2]
PAGE_ROOT = ROOT / "maia"


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.attributes: list[tuple[str, dict[str, str]]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.attributes.append((tag, {key: value or "" for key, value in attrs}))


def flatten_keys(value: object, prefix: str = "") -> set[str]:
    if not isinstance(value, dict):
        return {prefix} if prefix else set()
    keys: set[str] = set()
    for key, child in value.items():
        name = f"{prefix}.{key}" if prefix else key
        keys.update(flatten_keys(child, name))
    return keys


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def check(condition: bool, message: str, failures: list[str]) -> None:
    if not condition:
        failures.append(message)


def main() -> int:
    failures: list[str] = []
    html_path = PAGE_ROOT / "index.html"
    html = html_path.read_text(encoding="utf-8")
    parser = PageParser()
    parser.feed(html)

    locale_keys: dict[str, set[str]] = {}
    for language in ("en", "zh-CN"):
        locale = json.loads((PAGE_ROOT / "locales" / f"{language}.json").read_text(encoding="utf-8"))
        locale_keys[language] = flatten_keys(locale)

    used_keys: set[str] = set()
    local_paths: set[Path] = set()
    focus_steps: list[int] = []
    for _, attrs in parser.attributes:
        if attrs.get("data-i18n"):
            used_keys.add(attrs["data-i18n"])
        if attrs.get("data-i18n-attr"):
            for declaration in attrs["data-i18n-attr"].split(";"):
                if ":" in declaration:
                    used_keys.add(declaration.split(":", 1)[1].strip())
        if attrs.get("data-focus-step"):
            focus_steps.append(int(attrs["data-focus-step"]))
        for attribute in ("src", "href"):
            raw = attrs.get(attribute, "").strip()
            if not raw or raw.startswith(("#", "mailto:", "data:")):
                continue
            parsed = urlparse(raw)
            if parsed.scheme or parsed.netloc or raw.startswith("../"):
                continue
            local_paths.add(PAGE_ROOT / parsed.path)

    for language, keys in locale_keys.items():
        missing = sorted(used_keys - keys)
        check(not missing, f"{language} locale misses keys: {missing}", failures)
    check(locale_keys["en"] == locale_keys["zh-CN"], "English and Chinese locale key sets differ", failures)
    check(sorted(focus_steps) == list(range(1, 9)), f"Focus steps must be 1..8, found {sorted(focus_steps)}", failures)
    for path in sorted(local_paths):
        check(path.exists(), f"Missing local page asset: {path.relative_to(ROOT)}", failures)

    manifest_path = PAGE_ROOT / "data" / "manifests" / "real-demo.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    check(manifest.get("demo_scope") == "real-model-inpainting-component-only", "Unexpected demo scope", failures)
    check(manifest.get("target_model_evaluated") is False, "Top-level target model flag must be false", failures)
    for sample in manifest.get("samples", []):
        check(sample.get("target_model_evaluated") is False, "Sample target model flag must be false", failures)
        for key in ("original_audio", "masked_audio", "original_spectrogram", "masked_spectrogram"):
            path = PAGE_ROOT / sample[key]
            check(path.exists(), f"Missing manifest asset: {path.relative_to(ROOT)}", failures)
        for candidate in sample.get("candidates", []):
            for key in ("regenerated_audio", "regenerated_spectrogram", "difference_spectrogram"):
                path = PAGE_ROOT / candidate[key]
                check(path.exists(), f"Missing candidate asset: {path.relative_to(ROOT)}", failures)

    active_sources = html + (PAGE_ROOT / "js" / "app.js").read_text(encoding="utf-8") + (PAGE_ROOT / "js" / "i18n.js").read_text(encoding="utf-8")
    prohibited_patterns = {
        "Math.random": r"Math\.random",
        "samples.json": r"(?:^|[/\"'])samples\.json(?:$|[?\"'])",
        "metrics.json": r"(?:^|[/\"'])metrics\.json(?:$|[?\"'])",
        "legacy demo.js": r"(?:src=|import\s+)[^\n>]*[/\"']demo\.js(?:[?\"'])",
        "legacy audio-player.js": r"(?:src=|import\s+)[^\n>]*[/\"']audio-player\.js(?:[?\"'])",
        "Successful Attack": r"Successful Attack",
        "Live Generation": r"Live Generation",
    }
    for label, pattern in prohibited_patterns.items():
        check(re.search(pattern, active_sources) is None, f"Active page still references prohibited legacy behavior: {label}", failures)
    check(re.search(r"fetch\(['\"]data/manifests/real-demo\.json", active_sources) is not None, "Verified manifest is not the active data source", failures)

    expected_hashes = {
        "2.png": "3b0cb1b958466b675c4a1e87a645957a67b58fb7fd9ddd403ba4240b72cf21fb",
        "3.png": "855fe17af678bea2cd45f56a988c2b325e00d20eade437ef9f9308c2c9534da1",
        "4.png": "116a8b90d1bafd9744b7020fb21e4ccd8733d1a755e6c30e7a39d3cba48086ab",
    }
    for filename, expected in expected_hashes.items():
        path = PAGE_ROOT / "assets" / "figures" / filename
        check(sha256(path) == expected, f"Protected figure changed: {filename}", failures)

    if failures:
        print("MAIA page validation FAILED")
        for failure in failures:
            print(f"- {failure}")
        return 1

    print("MAIA page validation PASSED")
    print(f"- locale keys: {len(locale_keys['en'])} per language")
    print(f"- translated DOM keys: {len(used_keys)}")
    print(f"- local HTML assets checked: {len(local_paths)}")
    print("- focus sequence: 1..8")
    print("- active data source: verified real-demo manifest")
    print("- protected figures: byte-identical")
    print("- prohibited legacy/random references: absent")
    return 0


if __name__ == "__main__":
    sys.exit(main())
