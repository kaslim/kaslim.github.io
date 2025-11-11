# LSA-Probe Method Visualization Enhancement - 实施报告

**日期**: 2025年11月4日  
**目标**: 为不熟悉成员推断的学者清晰展示 LSA-Probe 的工作机制

## ✅ 已完成的功能

### 1. Diffusion Process & Attack Overview Section
**位置**: Problem 和 Method 之间的新 section

**实现内容**:
- ✅ 三个并排流程图展示:
  - **Forward Diffusion**: x₀ → xₜ (添加噪声 ε)
  - **Clean Reverse**: xₜ → x̂₀ (去噪重建)
  - **Attacked Reverse**: xₜ+δₜ → x̂₀^δ (加扰动后去噪)
- ✅ Canvas 绘制波形示意图（清晰→模糊→清晰/降质）
- ✅ 数学公式展示:
  - xₜ = √(ᾱₜ)x₀ + √(1-ᾱₜ)ε
  - x̂₀ = Rₜ(xₜ; θ)
  - x̂₀^δ = Rₜ(xₜ + δₜ; θ)
- ✅ 关键要点说明:
  - 时间归一化扰动 δₜ = σₜδ̃
  - 感知距离度量 D(x̂₀, x̂₀^δ)
  - 对抗成本 C_adv 的含义
  - 中间步 t≈0.6T 的重要性

### 2. Member vs Non-Member Stability Comparison
**位置**: Method Section 中的 algorithm visualization 之后

**实现内容**:
- ✅ 900x400 Canvas 绘制对比曲线图
- ✅ X 轴: 扰动预算 η (0-0.8)
- ✅ Y 轴: 降质程度 D(x̂₀, x̂₀^δ) (0-1)
- ✅ 两条曲线:
  - Member (蓝色): 上升缓慢，C_adv ≈ 0.58
  - Non-member (橙色): 上升快速，C_adv ≈ 0.29
- ✅ 阈值 τ 水平虚线标记
- ✅ C_adv 竖直虚线标记
- ✅ 图例和详细说明文字
- ✅ 突出显示: Members 需要约 **2倍预算** 才能达到相同降质

### 3. Enhanced Algorithm Visualization
**位置**: 现有 algorithm canvas 顶部

**实现内容**:
- ✅ Diffusion timeline 横条 (t=0 → t=0.6T → t=T)
- ✅ 三个关键点标记:
  - t=0 (x₀, 绿色)
  - t=0.6T (攻击点, 蓝色高亮)
  - t=T (噪声, 灰色)
- ✅ 前向和反向过程箭头:
  - Forward: +ε (虚线)
  - Reverse: Rₜ (实线)
- ✅ 动画同步:
  - 算法执行时，攻击点闪烁/脉动
  - frame 60-150 显示 "+ δₜ" 标注

### 4. Perceptual Distance Explanation
**位置**: Method Section 末尾，timestep-insight 之前

**实现内容**:
- ✅ 新小节 "Why Perceptual Distance?"
- ✅ 四个度量指标卡片:
  - **CDPAM**: Cognitive Model, 心理声学现象
  - **MR-STFT**: Multi-Resolution STFT, 多分辨率频谱
  - **Log-Mel MSE**: 对数梅尔频谱，音色特征
  - **Waveform MSE**: 波形直接对比，基线
- ✅ 说明为何感知度量优于简单 MSE

### 5. Navigation & Integration
- ✅ 导航栏新增 "Mechanism" 链接指向 diffusion-overview
- ✅ 所有可视化在 DOMContentLoaded 时自动初始化
- ✅ 响应式设计：移动端自动堆叠显示

## 📁 文件清单

### 新建文件 (2个)
1. `lsa-probe/css/diffusion-viz.css` (203行)
   - Diffusion 流程图样式
   - Stability 对比图样式
   - Perceptual distance 卡片样式
   - 响应式布局

2. `lsa-probe/js/diffusion-viz.js` (265行)
   - `initializeDiffusionViz()`: 初始化三个流程图
   - `drawFlowDiagram()`: 绘制 forward/reverse 流程
   - `drawWaveform()`: 波形示意图（带噪声模拟）
   - `drawArrow()`: 箭头和标注
   - `drawStabilityComparison()`: Member vs Non-member 曲线对比

### 修改文件 (3个)
1. `lsa-probe/index.html`
   - 添加 diffusion-viz.css 引用
   - 插入 Diffusion Overview Section (74行 HTML)
   - 插入 Stability Comparison (31行)
   - 插入 Perceptual Distance Explanation (38行)
   - 添加 diffusion-viz.js 引用
   - 更新导航栏

2. `lsa-probe/js/main.js`
   - DOMContentLoaded 中调用 `initializeDiffusionViz()`
   - 调用 `drawStabilityComparison()`

3. `lsa-probe/js/algorithm-viz.js`
   - `drawAlgorithm()` 中添加 timeline 绘制
   - 新增 `drawDiffusionTimeline()` 函数 (94行)
   - 调整 Binary Search 和 PGD 的 y 坐标以适应 timeline

## 🎨 视觉效果

### Diffusion 流程图
- 三个 300x200 Canvas，并排显示
- 简化波形（正弦波 + 噪声模拟）
- 箭头和公式标注
- 颜色编码：Forward (绿), Clean Reverse (蓝), Attacked (橙)

### Stability 对比图
- 900x400 Canvas，坐标轴、网格、图例完整
- Member 曲线斜率小（稳定）
- Non-member 曲线斜率大（不稳定）
- τ 阈值线和 C_adv 标记清晰

### Algorithm Timeline
- 与现有算法动画完美集成
- 脉动效果突出攻击注入点
- 前向/反向过程一目了然

## 🔍 关键数据

- **总新增代码**: ~900 行
- **Canvas 数量**: 5 个 (3个流程 + 1个stability + 1个algorithm)
- **D3.js 图表**: 保持原有 (ROC, Distribution, Budget, Metric)
- **响应式断点**: 1024px, 768px

## ✨ 用户体验改进

### 对于不熟悉 Diffusion 的学者
1. **流程清晰**: 一眼看懂 forward → reverse → attack 三个步骤
2. **直观对比**: Member vs Non-member 的稳定性差异可视化
3. **公式与图结合**: 每个流程都配有对应数学公式
4. **动画演示**: Algorithm timeline 展示攻击注入的具体位置

### 对于熟悉 MIA 的学者
1. **技术细节完整**: 时间归一化、感知距离、对抗成本都有说明
2. **可交互探索**: Explorer section 仍保留完整功能
3. **多角度展示**: 静态图解 + 动画 + 交互式探索器

## 🚀 部署状态

- ✅ 代码已提交: commit `57321df`
- ✅ 已推送到 GitHub: `main` 分支
- ✅ GitHub Pages 将在 1-2 分钟内更新
- 🌐 访问地址: https://kaslim.github.io/lsa-probe/

## 📝 验证清单

- ✅ Diffusion 流程图正确显示
- ✅ Stability 对比曲线准确（Member > Non-member）
- ✅ Algorithm timeline 与动画同步
- ✅ 感知距离说明清晰
- ✅ 响应式设计在移动端正常
- ✅ 所有数学公式正确渲染（KaTeX）
- ✅ 导航链接功能正常

## 🎯 实现与计划对照

| 计划项 | 状态 | 说明 |
|-------|------|------|
| 1. Diffusion Overview Section | ✅ | 完整实现三流程图 + 关键要点 |
| 2. Stability Comparison | ✅ | Canvas 绘制对比曲线 |
| 3. Algorithm Timeline | ✅ | 集成到现有动画中 |
| 4. Perceptual Distance | ✅ | 四个指标卡片说明 |
| 5. CSS & 响应式 | ✅ | 新建 diffusion-viz.css |

## 📌 后续建议（可选）

1. **添加实际音频示例**: 在 Diffusion Overview 中加入可播放的音频片段
2. **交互式 timeline**: 让用户可以拖动选择不同 t_ratio 观察效果
3. **A/B 测试**: 添加按钮切换"有扰动"和"无扰动"的对比
4. **更多动画**: Stability 曲线可以添加逐步绘制的动画效果

---

**实施完成！** 🎉

LSA-Probe 网页现在具备完整的方法可视化，能够让不熟悉成员推断或 diffusion 模型的学者快速理解核心机制。

