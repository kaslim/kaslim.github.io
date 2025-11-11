# 🔧 LSA-Probe 故障排查指南

## 当前状态

✅ **已修复的问题**:
1. `explorer.js:337` 语法错误（属性名包含点号）
2. `diffusion-viz.js` 函数名冲突（`drawArrow` → `drawFlowArrow`）
3. Favicon 404 警告（已添加 `favicon.svg`）

## 常见问题解答

### Q1: 看到 "favicon.ico 404" 错误
**答**: ✅ **这不是真正的问题！** 

这只是浏览器找不到网站图标文件的**警告**，不会导致页面功能失败。我已经添加了 `favicon.svg` 解决了这个警告。

### Q2: 页面显示 "Failed to load demo"
**可能原因**:
1. JavaScript 加载顺序问题
2. 数据文件未成功加载
3. Canvas API 不支持
4. GitHub Pages 部署延迟（需等待 1-2 分钟）

**解决方法**:
```bash
# 1. 等待 2 分钟后再访问
# 2. 强制刷新浏览器 (Ctrl/Cmd + Shift + R)
# 3. 清除浏览器缓存
# 4. 使用不同浏览器测试（Chrome, Firefox, Edge）
```

### Q3: 三个流程图（Forward/Reverse/Attacked）不显示
**诊断步骤**:
1. 打开浏览器开发者工具 (F12)
2. 查看 Console 标签页
3. 查找红色错误信息

**预期看到的正常日志**:
```
Initializing LSA-Probe demo...
✓ Demo initialized successfully
```

**如果看到错误**:
- 记下完整的错误消息（文件名、行号、错误类型）
- 检查 Network 标签，确认所有 JS 文件都成功加载（状态码 200）

## 调试工具

### 🔍 使用内置调试页面

#### 1. **根目录调试页面**
```
https://kaslim.github.io/test_local.html
```
功能：
- ✓ 检查所有脚本加载状态
- ✓ 检查函数可用性
- ✓ 测试 Canvas API
- ✓ 实时捕获 JavaScript 错误

#### 2. **LSA-Probe 专用调试页面**
```
https://kaslim.github.io/lsa-probe/debug_check.html
```
功能：
- ✓ 加载实际的 LSA-Probe JavaScript 文件
- ✓ 检查 D3.js 是否正常
- ✓ 检查所有可视化函数是否定义
- ✓ 测试数据文件访问
- ✓ 捕获所有错误并显示详细信息

### 🖥️ 本地测试

如果在线版本有问题，可以本地测试：

```bash
# 1. 进入项目目录
cd /home/yons/文档/AAAI/ISMIR/maia-demo

# 2. 启动本地服务器
python -m http.server 8001

# 3. 打开浏览器访问
http://localhost:8001/lsa-probe/debug_check.html

# 4. 如果调试页面一切正常，再访问
http://localhost:8001/lsa-probe/index.html
```

## 错误类型参考

### 1. SyntaxError: missing ) after argument list
**含义**: JavaScript 语法错误，通常是括号或引号不匹配
**已修复**: `explorer.js:337` 中的属性名点号问题

### 2. TypeError: Cannot set properties of undefined
**含义**: 尝试在 `undefined` 对象上设置属性
**已修复**: `diffusion-viz.js` 中的 `ctx` 参数传递问题

### 3. ReferenceError: XXX is not defined
**含义**: 函数或变量未定义
**可能原因**: 
- 脚本加载顺序错误
- 函数名拼写错误
- 脚本文件未成功加载

### 4. Failed to fetch / 404 Not Found
**含义**: 数据文件或资源未找到
**检查**:
- 文件路径是否正确
- GitHub Pages 是否已部署完成
- 网络连接是否正常

## 浏览器兼容性

**推荐浏览器**:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+

**不支持**:
- ❌ IE 11 及更早版本

## 检查清单

当页面无法正常工作时，请按此顺序检查：

- [ ] 1. 等待 2 分钟让 GitHub Pages 部署完成
- [ ] 2. 强制刷新浏览器 (Ctrl/Cmd + Shift + R)
- [ ] 3. 打开开发者工具查看 Console 错误
- [ ] 4. 访问调试页面: `/lsa-probe/debug_check.html`
- [ ] 5. 检查 Network 标签，确认所有文件状态为 200
- [ ] 6. 尝试其他浏览器
- [ ] 7. 尝试无痕/隐私模式
- [ ] 8. 本地运行测试

## GitHub Pages 特定问题

### 部署延迟
GitHub Pages 部署需要时间：
- 首次推送: 1-3 分钟
- 后续更新: 30-120 秒

**验证部署状态**:
1. 访问 `https://github.com/kaslim/kaslim.github.io`
2. 点击 "Actions" 标签
3. 查看最新的 workflow 运行状态（应该显示绿色 ✓）

### 缓存问题
GitHub Pages 和浏览器都可能缓存旧版本：

**清除方法**:
```
1. 硬刷新: Ctrl+Shift+R (Windows/Linux) 或 Cmd+Shift+R (Mac)
2. 或在 URL 后添加查询参数: ?v=2 (强制重新加载)
3. 或清除所有缓存: 浏览器设置 → 隐私 → 清除缓存
```

## 获取更详细的错误信息

如果问题依然存在，请提供以下信息：

### 1. Console 完整输出
```
F12 → Console 标签 → 右键 → Save as...
```

### 2. Network 请求状态
```
F12 → Network 标签 → 刷新页面 → 截图所有请求
```

### 3. 浏览器信息
```
浏览器类型和版本（例如: Chrome 120.0.6099.109）
操作系统（例如: Windows 11, macOS 14, Ubuntu 22.04）
```

### 4. 访问的 URL
```
完整的 URL（例如: https://kaslim.github.io/lsa-probe/）
```

### 5. 调试页面结果
```
访问 /lsa-probe/debug_check.html
截图所有检查结果
```

## 预期的正常行为

✅ **页面成功加载时应该看到**:
1. Hero section 正常显示，标题 "LSA-Probe"
2. Navigation bar 可点击，滚动时背景变化
3. Problem section 有动画效果
4. **三个 Diffusion 流程图**显示（Forward, Reverse, Attacked）
5. **Member vs Non-member 稳定性对比曲线**显示
6. Interactive slider 可以拖动
7. Adversarial Cost Distribution 图表正常显示
8. ROC curves 图表正常显示
9. Algorithm animation 可以播放/暂停/切换 Member/Non-member

✅ **Console 应该看到**:
```
Initializing LSA-Probe demo...
✓ Demo initialized successfully
```

❌ **不应该看到的错误**:
- SyntaxError
- TypeError
- ReferenceError
- Failed to fetch (except for external resources)

## 已知限制

1. **移动端**: 某些可视化在小屏幕上可能需要横屏查看
2. **低性能设备**: Canvas 动画可能不够流畅
3. **慢速网络**: 首次加载可能需要 5-10 秒

## 联系支持

如果以上方法都无法解决问题，请提供：
1. 完整的 Console 截图
2. 调试页面的结果截图  
3. 浏览器和操作系统信息
4. 尝试过的解决方法

---

**最后更新**: 2025-11-11  
**版本**: 2.1

