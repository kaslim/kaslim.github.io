# MAIA 图片设置说明

## 图片文件要求

请将以下四张图片从 `Figure/` 文件夹复制到 `maia/assets/images/` 目录：

### 需要替换的图片

1. **Grad-CAM heatmap on mel-spectrogram**
   - 目标文件：`assets/images/gradcam_heatmap.png`
   - 原图位置：`Figure/` 文件夹中的第 2 张图

2. **Selected important segments for inpainting**
   - 目标文件：`assets/images/selected_segments.png`
   - 原图位置：`Figure/` 文件夹中的第 3 张图

3. **Before Inpainting**
   - 目标文件：`assets/images/before_inpainting.png`
   - 原图位置：`Figure/` 文件夹中的第 3 张图（Before Inpainting）

4. **After Inpainting**
   - 目标文件：`assets/images/after_inpainting.png`
   - 原图位置：`Figure/` 文件夹中的第 4 张图

### 快速设置命令

如果 `Figure/` 文件夹在项目根目录下，可以使用以下命令：

```bash
cd /home/yons/文档/AAAI/ISMIR/maia-demo/maia
mkdir -p assets/images

# 假设 Figure 文件夹在某个位置，请根据实际情况调整路径
# 例如：如果 Figure 在 /home/yons/文档/AAAI/Figure/
cp /path/to/Figure/figure2.png assets/images/gradcam_heatmap.png
cp /path/to/Figure/figure3_segments.png assets/images/selected_segments.png
cp /path/to/Figure/figure3_before.png assets/images/before_inpainting.png
cp /path/to/Figure/figure4_after.png assets/images/after_inpainting.png
```

### 支持的图片格式

- PNG (推荐)
- JPG/JPEG
- 如果原图是其他格式，请转换为 PNG

### 图片命名

HTML 中已配置为以下文件名：
- `gradcam_heatmap.png` (或 `.jpg`)
- `selected_segments.png` (或 `.jpg`)
- `before_inpainting.png` (或 `.jpg`)
- `after_inpainting.png` (或 `.jpg`)

如果您的图片文件名不同，请：
1. 重命名图片文件，或
2. 修改 `maia/index.html` 中对应的 `<img src>` 路径

### 验证

复制图片后，在浏览器中打开 `maia/index.html`，检查以下位置是否显示图片：
- Method 部分，Step 1: Importance Analysis
- Method 部分，Step 2: Segment Selection  
- Method 部分，Step 3: Adversarial Inpainting (Before/After 对比)

