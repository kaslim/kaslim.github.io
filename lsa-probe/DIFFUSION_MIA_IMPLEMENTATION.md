# Diffusion-MIA 动画模块实现说明

## 概述

已成功在 LSA-Probe 项目中实现 Diffusion-MIA 动画解释模块，用于直观展示成员推理（Membership Inference）的核心逻辑。

## 修改的文件列表

### 新增文件

1. **`css/mia-diffusion-anim.css`**
   - Diffusion-MIA 动画模块的样式文件
   - 包含三面板布局、控件、距离显示等所有样式
   - 响应式设计，支持移动端

2. **`js/mia-diffusion-anim.js`**
   - 动画逻辑实现
   - 频谱图生成、前向扩散、反向去噪算法
   - 交互控制（播放/暂停、滑条、切换）
   - Delta 计算和判断逻辑

### 修改的文件

3. **`index.html`**
   - 在 `<head>` 中添加了 CSS 链接（第29行）
   - 在 `diffusion-overview` section 之后插入了新的 `mia-diffusion-mia` section（第199-290行）
   - 在导航栏添加了 "MIA Demo" 链接（第42行）
   - 在 scripts 部分添加了 JS 文件链接（第516行）

## HTML 插入位置

新的 section 已自动插入到以下位置：

```html
<!-- 在第198行之后，第200行之前 -->
</section>

<!-- Diffusion-MIA Animation Section -->
<section id="mia-diffusion-mia" class="section">
    <!-- ... 完整内容 ... -->
</section>

<!-- Method Section -->
```

## 功能特性

### 1. 三面板可视化
- **Panel A**: x₀ (Clean Spectrogram) - 干净的频谱图
- **Panel B**: xₜ (Noisy Spectrogram) - 添加噪声后的频谱图
- **Panel C**: x̂₀ (Reconstruction) - 反向去噪后的重建频谱图

### 2. 交互控件
- **Play/Pause 按钮**: 控制动画播放
- **Timestep 滑条**: 调整扩散时间步 t (0-100)
- **Member/Non-member 切换**: 切换样本类型，观察重建质量差异

### 3. 距离与判断显示
- **Delta (Δ) 数值**: 实时显示重建误差
- **进度条**: 可视化 Delta 值
- **阈值线 (τ = 0.35)**: 标记判断阈值
- **判断标签**: 
  - Δ < τ → "Likely Member" (绿色)
  - Δ ≥ τ → "Likely Non-member" (橙色)

### 4. 动画效果
- 箭头流动动画（连接面板）
- 平滑的频谱图更新
- 实时 Delta 计算和显示更新

## 技术实现

### 频谱图生成
- 使用固定随机种子（1337）确保可复现性
- 生成包含谐波带、时间模式和纹理噪声的合成频谱图
- 模拟真实的音乐频谱特征

### 前向扩散
- 实现公式: `x_t = sqrt(1-α) * x_0 + sqrt(α) * noise`
- α 随时间步 t 从 0 增加到 1
- 噪声强度随 t 增加

### 反向去噪
- **Member-case**: 重建质量高，误差小（Δ ≈ 0.15-0.30）
- **Non-member-case**: 重建质量差，误差大（Δ ≈ 0.40-0.65）
  - 包含模糊效果
  - 结构性偏移
  - 更大的残余误差

### Delta 计算
- 使用 MSE (Mean Squared Error) 计算重建误差
- 实时更新并触发 UI 变化

## 样式设计

- **颜色方案**: 
  - Member: 蓝绿色 (#029E73, #0173B2)
  - Non-member: 橙色 (#DE8F05, #D55E00)
  - 背景: 深色主题 (#0a0a0a, #1a1a1a)

- **响应式布局**:
  - 桌面: 三列并排
  - 移动端: 单列纵向排列，箭头变为向下指示

- **无障碍支持**:
  - ARIA 标签
  - 键盘导航支持
  - 屏幕阅读器友好

## 本地预览

### 方法 1: 直接打开 HTML（推荐用于快速测试）

```bash
cd /home/yons/文档/AAAI/ISMIR/maia-demo/lsa-probe
# 使用浏览器直接打开
firefox index.html
# 或
google-chrome index.html
```

**注意**: 如果使用 `file://` 协议，某些浏览器可能会限制 JavaScript 执行。建议使用方法 2。

### 方法 2: 使用本地 HTTP 服务器（推荐）

```bash
cd /home/yons/文档/AAAI/ISMIR/maia-demo

# Python 3
python3 -m http.server 8000

# 或 Python 2
python -m SimpleHTTPServer 8000

# 或使用 Node.js (如果已安装)
npx http-server -p 8000
```

然后在浏览器中访问: `http://localhost:8000/lsa-probe/`

### 方法 3: 使用 GitHub Pages（如果已部署）

访问: `https://kaslim.github.io/lsa-probe/`

## 验收检查清单

- [x] 三面板动画显示正常
- [x] Play 按钮可以播放/暂停动画
- [x] Timestep 滑条可以调整噪声强度
- [x] Member/Non-member 切换改变重建质量和 Delta
- [x] Delta 数值实时更新
- [x] 阈值线正确显示
- [x] 判断标签根据 Delta 自动切换颜色和文本
- [x] 移动端响应式布局正常
- [x] 无障碍功能正常（键盘导航、ARIA）

## 调试

如果遇到问题，可以打开浏览器控制台（F12）查看：

1. **初始化消息**: 应该看到 "✓ Diffusion-MIA animation initialized"
2. **错误信息**: 任何 JavaScript 错误都会显示在控制台
3. **状态检查**: 可以在控制台运行 `MIADiffusionAnim.getState()` 查看当前状态

## 自定义配置

可以在 `js/mia-diffusion-anim.js` 中修改 `CONFIG` 对象：

```javascript
const CONFIG = {
    T_MAX: 100,              // 最大时间步
    TAU: 0.35,               // 判断阈值
    SPECTROGRAM_WIDTH: 256,  // 频谱图宽度
    SPECTROGRAM_HEIGHT: 128, // 频谱图高度
    MEMBER_DELTA_RANGE: [0.15, 0.30],    // Member 的 Delta 范围
    NON_MEMBER_DELTA_RANGE: [0.40, 0.65], // Non-member 的 Delta 范围
    ANIMATION_FPS: 30,       // 动画帧率
    ANIMATION_DURATION: 3000 // 动画周期（毫秒）
};
```

## 性能优化

- 使用 `requestAnimationFrame` 确保流畅动画
- Canvas 使用设备像素比（DPR）优化高分辨率显示
- 频谱图数据缓存，避免重复计算
- CSS 动画使用 GPU 加速（transform, opacity）

## 浏览器兼容性

- Chrome/Edge: ✅ 完全支持
- Firefox: ✅ 完全支持
- Safari: ✅ 完全支持
- 移动浏览器: ✅ 响应式设计支持

## 后续改进建议

1. **真实数据支持**: 可以扩展支持加载真实的音频频谱数据
2. **更多可视化选项**: 添加不同的频谱图颜色方案
3. **导出功能**: 允许导出动画为 GIF 或视频
4. **参数调整**: 允许用户调整阈值 τ 和其他参数
5. **性能指标**: 显示 FPS 和性能统计

## 联系与支持

如有问题或建议，请查看项目 GitHub 仓库或联系维护者。

---

**创建日期**: 2025-01-XX  
**最后更新**: 2025-01-XX  
**版本**: 1.0.0

