#!/bin/bash
# Script to copy figures from Figure folder to assets/images/

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="$SCRIPT_DIR/assets/images"
SOURCE_DIR=""

# Create target directory
mkdir -p "$TARGET_DIR"

echo "MAIA Figure Copy Script"
echo "======================="
echo ""

# Try to find Figure folder
POSSIBLE_PATHS=(
    "$SCRIPT_DIR/../../Figure"
    "$SCRIPT_DIR/../../../Figure"
    "$HOME/文档/AAAI/Figure"
    "$HOME/文档/AAAI/ISMIR/Figure"
    "$HOME/文档/AAAI/paper/figures"
)

for path in "${POSSIBLE_PATHS[@]}"; do
    if [ -d "$path" ]; then
        SOURCE_DIR="$path"
        echo "Found Figure folder at: $SOURCE_DIR"
        break
    fi
done

if [ -z "$SOURCE_DIR" ]; then
    echo "⚠️  Could not find Figure folder automatically."
    echo ""
    echo "Please provide the path to your Figure folder:"
    read -p "Figure folder path: " SOURCE_DIR
    
    if [ ! -d "$SOURCE_DIR" ]; then
        echo "❌ Error: Directory '$SOURCE_DIR' does not exist!"
        exit 1
    fi
fi

echo "Source directory: $SOURCE_DIR"
echo "Target directory: $TARGET_DIR"
echo ""

# List files in source directory
echo "Files in source directory:"
ls -lh "$SOURCE_DIR" | grep -E "\.(png|jpg|jpeg|PNG|JPG|JPEG)$" | head -10
echo ""

# Ask user which files to copy
echo "Please specify which files to copy:"
echo ""
echo "1. Grad-CAM heatmap (file 2):"
read -p "   File name: " FILE1
echo "2. Selected segments (file 3):"
read -p "   File name: " FILE2
echo "3. Before inpainting (file 3):"
read -p "   File name: " FILE3
echo "4. After inpainting (file 4):"
read -p "   File name: " FILE4

# Copy files
if [ -f "$SOURCE_DIR/$FILE1" ]; then
    cp "$SOURCE_DIR/$FILE1" "$TARGET_DIR/gradcam_heatmap.${FILE1##*.}"
    echo "✓ Copied: gradcam_heatmap.${FILE1##*.}"
else
    echo "✗ Not found: $SOURCE_DIR/$FILE1"
fi

if [ -f "$SOURCE_DIR/$FILE2" ]; then
    cp "$SOURCE_DIR/$FILE2" "$TARGET_DIR/selected_segments.${FILE2##*.}"
    echo "✓ Copied: selected_segments.${FILE2##*.}"
else
    echo "✗ Not found: $SOURCE_DIR/$FILE2"
fi

if [ -f "$SOURCE_DIR/$FILE3" ]; then
    cp "$SOURCE_DIR/$FILE3" "$TARGET_DIR/before_inpainting.${FILE3##*.}"
    echo "✓ Copied: before_inpainting.${FILE3##*.}"
else
    echo "✗ Not found: $SOURCE_DIR/$FILE3"
fi

if [ -f "$SOURCE_DIR/$FILE4" ]; then
    cp "$SOURCE_DIR/$FILE4" "$TARGET_DIR/after_inpainting.${FILE4##*.}"
    echo "✓ Copied: after_inpainting.${FILE4##*.}"
else
    echo "✗ Not found: $SOURCE_DIR/$FILE4"
fi

echo ""
echo "✅ Done! Check $TARGET_DIR for copied files."
echo ""
echo "If file extensions don't match, you may need to update"
echo "the <img src> paths in maia/index.html"

