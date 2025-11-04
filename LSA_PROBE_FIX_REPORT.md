# LSA-Probe 加载问题修复报告

**日期**: 2025年11月4日  
**问题**: LSA-Probe 页面显示 "Failed to load demo. Please refresh the page."

## 修复内容

### 1. JavaScript 初始化问题

**问题**: `main.js` 中有代码在 DOM 加载前执行，导致找不到元素。

**修复**:
```javascript
// 之前：在全局作用域执行
document.querySelectorAll('a[href^="#"]').forEach(...) // DOM 可能未加载
const navbar = document.getElementById('navbar'); // 可能返回 null

// 修复后：在 DOMContentLoaded 中执行
document.addEventListener('DOMContentLoaded', async () => {
    // 确保 DOM 已加载
    document.querySelectorAll('a[href^="#"]').forEach(...)
    const navbar = document.getElementById('navbar');
    if (navbar) { ... }
});
```

### 2. 函数引用检查

**问题**: 初始化函数可能在其他 JS 文件加载前被调用。

**修复**:
```javascript
// 添加防御性检查
if (typeof initializeBaselines === 'function') {
    initializeBaselines();
}
if (typeof initializeExplorer === 'function') {
    initializeExplorer();
}
// ... 其他函数
```

### 3. 数据加载错误处理

**问题**: 数据加载失败时没有详细的错误信息。

**修复**:
```javascript
// 添加 HTTP 状态检查
const response = await fetch(file);
if (!response.ok) {
    throw new Error(`Failed to load ${file}: ${response.status}`);
}

// 添加 JSON 解析错误处理
try {
    return await r.json();
} catch (error) {
    console.error(`Failed to parse ${file}:`, error);
    throw error;
}
```

### 4. 全局函数可用性

**问题**: `formatPercent` 函数在其他 JS 文件中调用时可能未定义。

**修复**:
```javascript
// 确保函数在全局作用域可用
window.formatNumber = function(num, decimals = 2) {
    return Number(num).toFixed(decimals);
};

window.formatPercent = function(num, decimals = 1) {
    return (num * 100).toFixed(decimals) + '%';
};
```

## 如何验证修复

### 方法 1: 使用浏览器开发者工具

1. 打开 LSA-Probe 页面：https://kaslim.github.io/lsa-probe/
2. 按 `F12` 打开开发者工具
3. 切换到 **Console** 标签
4. 查看日志输出：

**成功的日志应该显示**:
```
Initializing LSA-Probe demo...
Loading data files...
Fetching data/adversarial_costs.json...
Fetching data/roc_curves.json...
... (所有 6 个文件)
All files fetched, parsing JSON...
✓ All data loaded successfully
Data structure: (6) ['adversarialCosts', 'rocCurves', 'budgetAblation', ...]
Initializing explorer...
✓ Explorer initialized
Initializing algorithm visualization...
✓ Algorithm visualization initialized
✓ Demo initialized successfully
```

**如果仍有错误**，日志会显示：
```
Error loading data: Error: Failed to load data/xxx.json: 404 Not Found
Failed to load demo. Please refresh the page.
```

### 方法 2: 检查网络请求

1. 在开发者工具中切换到 **Network** 标签
2. 刷新页面 (`Ctrl+R` 或 `Cmd+R`)
3. 检查所有资源是否成功加载（状态码 200）

**需要成功加载的文件**:
- `index.html`
- `css/main.css`
- `css/explorer.css`
- `css/algorithm.css`
- `js/main.js`
- `js/data-loader.js`
- `js/explorer.js`
- `js/algorithm-viz.js`
- `js/roc-interactive.js`
- `data/adversarial_costs.json`
- `data/roc_curves.json`
- `data/budget_ablation.json`
- `data/metric_comparison.json`
- `data/baselines.json`
- `data/main_results.json`

### 方法 3: 本地测试

如果 GitHub Pages 还未更新（通常需要 1-2 分钟），可以本地测试：

```bash
cd /home/yons/文档/AAAI/ISMIR/maia-demo
python -m http.server 8000

# 然后在浏览器打开
# http://localhost:8000/test_lsa_probe.html
```

点击 "Check Data Files" 和 "Check Scripts" 按钮验证所有文件可访问。

## 常见问题排查

### 问题 1: "Failed to load demo" 仍然出现

**可能原因**:
1. GitHub Pages 缓存未更新
2. 浏览器缓存了旧版本

**解决方法**:
1. 等待 2-3 分钟让 GitHub Pages 部署完成
2. 强制刷新页面：
   - Windows/Linux: `Ctrl + Shift + R`
   - macOS: `Cmd + Shift + R`
3. 清除浏览器缓存或使用无痕模式

### 问题 2: 数据文件 404

**可能原因**: 文件路径不正确

**检查**:
```bash
# 确认文件存在
cd /home/yons/文档/AAAI/ISMIR/maia-demo/lsa-probe/data
ls -la

# 应该看到 6 个 JSON 文件
```

### 问题 3: JavaScript 错误

**可能原因**: 浏览器不支持某些 ES6+ 特性

**检查**: 使用现代浏览器（Chrome 90+, Firefox 88+, Safari 14+）

### 问题 4: 图表不显示

**可能原因**: D3.js 未加载

**检查**: 确认 `<script src="https://d3js.org/d3.v7.min.js"></script>` 在 HTML 中

## GitHub Pages 部署状态

查看部署状态：
1. 访问 https://github.com/kaslim/kaslim.github.io/actions
2. 查看最新的 "pages build and deployment" workflow
3. 确保状态为 ✅ Success

## 当前状态

- ✅ 代码已修复并推送到 GitHub
- ✅ 本地测试文件已创建 (`test_lsa_probe.html`)
- ✅ 错误处理已改进
- ⏳ GitHub Pages 正在部署（预计 1-2 分钟）

## 下一步

1. **等待 2-3 分钟**让 GitHub Pages 完成部署
2. **强制刷新**页面清除缓存
3. **检查控制台**查看详细日志
4. 如果仍有问题，运行本地测试脚本诊断

## 修改文件列表

- `lsa-probe/js/main.js`: 重构初始化逻辑，添加防御性检查
- `lsa-probe/js/data-loader.js`: 改进错误处理和日志记录
- `test_lsa_probe.html`: 新增本地测试工具

## Git 提交

```
commit cd047ce
Author: Your Name
Date: Mon Nov 4 18:XX:XX 2025

Fix LSA-Probe initialization and data loading issues

- Move DOM-dependent code into DOMContentLoaded event handler
- Add defensive checks for function existence before calling
- Improve error handling in data loader with detailed logging
- Validate HTTP response status before parsing JSON
- Make formatNumber and formatPercent globally available
- Remove duplicate showError function definition
```

---

**修复完成！** 🎉

如果仍有问题，请：
1. 查看浏览器控制台的完整错误信息
2. 运行 `test_lsa_probe.html` 诊断文件
3. 检查 GitHub Actions 部署日志

