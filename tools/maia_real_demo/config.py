from pathlib import Path


ROOT = Path(__file__).resolve().parent
REPOSITORY_ROOT = ROOT.parents[1]
CACHE = ROOT / ".cache"
GACELA_SOURCE = CACHE / "GACELA"
CHECKPOINT_ARCHIVE = CACHE / "maestro-short_checkpoints.zip"
CHECKPOINT = (
    CACHE
    / "saved_results"
    / "real_data_240_32_240_checkpoints"
    / "01_310000.pt"
)
SOURCE_CACHE = CACHE / "source" / "open_goldberg_variation_20.ogg"

AUDIO_OUTPUT = REPOSITORY_ROOT / "maia" / "data" / "audio" / "real-demo"
SPECTROGRAM_OUTPUT = REPOSITORY_ROOT / "maia" / "data" / "spectrograms" / "real-demo"
MANIFEST_OUTPUT = REPOSITORY_ROOT / "maia" / "data" / "manifests" / "real-demo.json"
RUN_RECORD = CACHE / "run-record.json"

GACELA_REPOSITORY = "https://github.com/andimarafioti/GACELA.git"
GACELA_COMMIT = "34649fb01bdecbcb266db046a8b9c48c141f16e1"
CHECKPOINT_URL = (
    "https://zenodo.org/records/3897144/files/"
    "maestro-short_checkpoints.zip?download=1"
)
CHECKPOINT_ARCHIVE_MD5 = "1ac767255cf9edd53b8215a4301132dc"
CHECKPOINT_SHA256 = "bd32992080febfbc37f7e77b625ca11a4580c804a12cfa6bfdba4b2b14688970"

SOURCE_PAGE = (
    "https://commons.wikimedia.org/wiki/"
    "File:Kimiko_Ishizaka_-_21_-_Variatio_20_a_2_Clav.ogg"
)
SOURCE_URL = (
    "https://upload.wikimedia.org/wikipedia/commons/f/f9/"
    "Kimiko_Ishizaka_-_21_-_Variatio_20_a_2_Clav.ogg"
)
SOURCE_SHA1 = "7e9904569f9719d7b09eae960a82ab45153979ce"
SOURCE_LICENSE = "CC0 1.0 Universal"
SOURCE_ATTRIBUTION = (
    "J. S. Bach, Goldberg Variations, Variatio 20 a 2 Clav.; "
    "performed by Kimiko Ishizaka"
)

SAMPLE_ID = "goldberg_variation20_excerpt"
EXCERPT_START_SECONDS = 20.0
EXCERPT_DURATION_SECONDS = 30.0
SAMPLE_RATE = 22050
FFT_LENGTH = 1024
HOP_LENGTH = 256
LEFT_CONTEXT_FRAMES = 240
GAP_FRAMES = 32
RIGHT_CONTEXT_FRAMES = 240
CROSSFADE_SECONDS = 0.02

# These intervals are preserved from the first sample in the legacy MAIA page.
# The original generator hard-coded them; no target-model attribution is claimed.
LEGACY_REGIONS_SECONDS = [[5.0, 5.4], [12.0, 12.3], [18.0, 18.5]]
CANDIDATE_SEEDS = [1401, 2207, 3511]
GENERATION_DATE = "2026-09-04"
