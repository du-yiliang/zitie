# 字帖生成器项目开发文档

## 1. 项目概述

### 1.1 项目背景
随着数字化时代的发展，传统的字帖学习方式逐渐向数字化转型。为了满足用户快速生成个性化字帖的需求，开发了这款基于Web的字帖生成器，支持多种字体、纸张大小和样式的定制，方便用户打印和练习书法。

### 1.2 项目目标
- 提供简单易用的界面，让用户快速生成个性化字帖
- 支持多种字体和纸张样式，满足不同用户的需求
- 提供高质量的PDF导出功能，方便用户打印
- 支持文件导入，提高用户使用效率
- 确保良好的响应式设计，适配不同设备

### 1.3 主要功能
- **文字输入**：支持直接输入文字或上传TXT/DOCX文件
- **字体选择**：提供5种常用字体（行楷、楷书、楷体、宋体、衬线体）
- **纸张尺寸**：支持A4、A3、B5三种常用纸张尺寸
- **字体样式**：可调整字体大小、颜色和透明度
- **中空文字**：支持生成中空文字效果，方便描红练习
- **格子样式**：可定制田字格颜色和透明度
- **纸张样式**：支持三种纸张样式（田字格、横线纸张、米字格）
- **多页生成**：自动分页，支持特殊字符`#`强制分页
- **PDF导出**：高质量PDF导出，支持多页导出

### 1.4 技术亮点
- 使用React hooks进行状态管理，代码结构清晰
- 采用html2canvas + jsPDF实现高质量PDF导出
- 支持DOCX文件解析，提高用户使用便利性
- 响应式设计，适配不同设备
- 模块化设计，便于后续功能扩展

## 2. 技术栈

### 2.1 核心技术

| 技术/库 | 用途 | 版本 | 选择理由 |
|--------|------|------|----------|
| React | 前端框架 | 18.x | 组件化开发，高效的虚拟DOM，丰富的生态系统 |
| Vite | 构建工具 | 5.x | 快速的开发服务器，优化的构建输出，配置简单 |
| jsPDF | PDF生成库 | 2.x | 轻量级，易于使用，支持多种PDF操作 |
| html2canvas | HTML转Canvas | 1.4.x | 高质量的HTML渲染，支持复杂样式，良好的浏览器兼容性 |
| mammoth.js | DOCX文件解析 | 1.6.x | 强大的DOCX解析能力，支持提取纯文本，使用简单 |

### 2.2 依赖管理
- **npm**: 用于管理项目依赖和脚本

### 2.3 浏览器支持
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 3. 项目结构

```
├── src/                      # 源代码目录
│   ├── App.jsx               # 主应用组件，包含核心业务逻辑
│   ├── index.css             # 全局样式文件
│   ├── main.jsx              # 应用入口文件，渲染根组件
├── index.html                # HTML模板文件
├── package.json              # 项目配置和依赖管理
├── vite.config.js            # Vite构建配置
├── script.js                 # 额外脚本文件（可选）
├── style.css                 # 额外样式文件（可选）
└── README.md                 # 项目开发文档
```

### 3.1 文件说明

| 文件/目录 | 主要职责 | 关键内容 |
|----------|----------|----------|
| `src/App.jsx` | 主应用组件 | 状态管理、表单处理、字帖生成、PDF导出 |
| `src/index.css` | 全局样式 | 基础样式、表单样式、纸张样式、响应式设计 |
| `src/main.jsx` | 应用入口 | ReactDOM.createRoot() 渲染根组件 |
| `index.html` | HTML模板 | 定义应用容器和外部资源引入 |
| `package.json` | 项目配置 | 依赖管理、脚本命令、项目元数据 |
| `vite.config.js` | Vite配置 | 构建选项、插件配置、服务器配置 |

## 4. 核心组件与功能

### 4.1 主应用组件 (App.jsx)

#### 4.1.1 状态管理

App组件使用React Hooks管理以下状态：

| 状态变量 | 类型 | 默认值 | 说明 |
|---------|------|--------|------|
| `text` | `string` | `''` | 存储用户输入的文字内容 |
| `selectedFont` | `string` | `'Ma Shan Zheng'` | 当前选择的字体，默认为行楷 |
| `selectedPaperSize` | `string` | `'A4'` | 当前选择的纸张大小，默认为A4 |
| `fontSize` | `number` | `70` | 字体大小百分比，范围20-200 |
| `fontColor` | `string` | `'#333333'` | 字体颜色，十六进制格式 |
| `fontOpacity` | `number` | `100` | 字体透明度百分比，范围30-100 |
| `pages` | `array` | `[]` | 生成的字帖页面数组，每个页面包含字符和格子大小 |
| `gridColor` | `string` | `'#000000'` | 格子颜色，十六进制格式 |
| `gridOpacity` | `number` | `30` | 格子透明度百分比，范围10-100 |
| `paperStyle` | `string` | `'default'` | 纸张样式：default(田字格)、lined(横线)、rice(米字格) |
| `isHollowText` | `boolean` | `false` | 是否为中空文字，用于描红练习 |

#### 4.1.2 纸张配置

```javascript
const paperConfig = {
  A4: { width: 210, height: 297, columns: 10, rows: 15 },
  A3: { width: 297, height: 420, columns: 14, rows: 20 },
  B5: { width: 176, height: 250, columns: 8, rows: 13 }
}
```

#### 4.1.3 关键函数详解

##### 4.1.3.1 文件上传处理

```javascript
/**
 * 处理文件上传
 * @param {File} file - 上传的文件对象
 */
const handleFileUpload = (file) => {
  // 检查文件大小（限制为1MB）
  const MAX_FILE_SIZE = 1 * 1024 * 1024 // 1MB
  if (file.size > MAX_FILE_SIZE) {
    alert('文件大小不能超过1MB！')
    return
  }

  // 根据文件类型调用不同的处理函数
  if (file.name.endsWith('.txt')) {
    readTxtFile(file) // 处理TXT文件
  } else if (file.name.endsWith('.docx')) {
    readDocxFile(file) // 处理DOCX文件
  }
}
```

##### 4.1.3.2 生成字帖核心逻辑

**函数签名**：
```javascript
const generateCalligraphy = () => {
  // 实现逻辑
}
```

**实现步骤**：
1. 验证输入文字是否为空
2. 根据选择的纸张大小获取配置
3. 计算每个格子的大小（考虑边距和间距）
4. 遍历每个字符，生成字帖页面
5. 支持特殊字符`#`强制分页
6. 处理换行符，避免文本中的换行导致提前分页
7. 将生成的页面存储到状态中

**关键计算**：
```javascript
// 计算每个格子的大小
const margin = 20
const gap = 2 // mm
const maxGridWidth = Math.floor((config.width - margin - gap * (config.columns - 1)) / config.columns)
const maxGridHeight = Math.floor((config.height - margin - gap * (config.rows - 1)) / config.rows)
const calculatedGridSize = {
  width: Math.min(maxGridWidth, maxGridHeight),
  height: Math.min(maxGridWidth, maxGridHeight)
}
```

##### 4.1.3.3 PDF导出功能

**函数签名**：
```javascript
const exportPDF = () => {
  // 实现逻辑
}
```

**实现细节**：
- 使用jsPDF库创建PDF实例
- 使用html2canvas将HTML元素转换为Canvas
- 支持多页PDF生成
- 显示导出进度提示
- 优化渲染性能，减少内存占用

**html2canvas配置**：
```javascript
const canvas = await html2canvas(paper, {
  scale: 2, // 缩放比例，影响PDF清晰度
  useCORS: true, // 允许跨域图片
  logging: false, // 关闭日志
  backgroundColor: '#ffffff', // 背景色
  windowWidth: paper.offsetWidth, // 窗口宽度
  windowHeight: paper.offsetHeight, // 窗口高度
  allowTaint: true, // 允许污染
  useForeignObjectForSVG: true, // 使用ForeignObject渲染SVG
  timeout: 60000 // 超时设置（60秒）
})
```

##### 4.1.3.4 田字格渲染函数

**函数签名**：
```javascript
const renderGrid = (gridChar, gridSize) => {
  // 实现逻辑
}
```

**参数说明**：
- `gridChar`: 包含字符信息的对象 `{ char: '字' }`
- `gridSize`: 格子大小对象 `{ width: 18, height: 18 }`

**实现细节**：
- 根据纸张样式渲染不同类型的格子（田字格、米字格等）
- 动态计算格子线的透明度和颜色
- 支持中空文字效果
- 响应式字体大小计算

### 4.2 样式设计 (index.css)

#### 4.2.1 基础样式
- 重置浏览器默认样式
- 设置全局字体和颜色
- 容器布局设计

#### 4.2.2 表单样式
- 输入框、选择框样式
- 滑块控件自定义样式
- 响应式表单布局

#### 4.2.3 纸张与格子样式
- 不同纸张尺寸的样式定义
- 田字格、米字格等不同样式的实现
- 格子内字符的样式设置

#### 4.2.4 打印样式
- 优化打印效果，移除不必要的元素
- 调整纸张边距和大小
- 确保格子和文字清晰可见

#### 4.2.5 响应式设计
- 针对移动设备优化布局
- 表单在移动端垂直排列
- 纸张在移动端自适应宽度

**媒体查询示例**：
```css
/* 响应式设计 - 针对移动设备 */
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }
  
  .paper {
    width: 100%;
    height: auto;
    overflow: auto;
  }
}
```

## 5. 页面布局

### 5.1 整体布局

应用采用单页设计，主要分为两个区域：
1. **表单配置区域**：位于页面顶部，包含各种样式配置选项
2. **字帖预览区域**：位于页面下方，显示生成的字帖效果

### 5.2 表单配置区域

表单区域采用响应式网格布局，在桌面端水平排列，在移动端垂直排列。包含以下功能模块：

#### 5.2.1 文字输入模块
- 多行文本输入框，用于直接输入文字
- 文件上传按钮，支持TXT和DOCX格式
- 文件大小限制提示（最大1MB）

#### 5.2.2 基础配置模块
- 字体选择下拉框（5种字体可选）
- 纸张大小选择下拉框（A4、A3、B5）

#### 5.2.3 字体样式模块
- 字体大小滑块（20%-200%）
- 字体颜色选择器
- 字体透明度滑块（30%-100%）
- 中空文字开关

#### 5.2.4 格子样式模块
- 格子颜色选择器
- 格子透明度滑块（10%-100%）
- 纸张样式选择下拉框（田字格、横线、米字格）

#### 5.2.5 操作按钮
- "生成字帖"按钮：触发字帖生成逻辑
- "导出PDF"按钮：将生成的字帖导出为PDF文件

### 5.3 字帖预览区域

#### 5.3.1 页面容器
- 每个页面使用`.paper`类标识，模拟真实纸张效果
- 支持不同纸张尺寸的显示
- 添加阴影效果增强立体感

#### 5.3.2 格子布局
- 采用CSS Grid或Flexbox实现田字格的网格布局
- 格子间距固定为2mm
- 字符居中显示在格子内

#### 5.3.3 多页支持
- 自动分页显示
- 每页独立渲染
- 支持无限多页生成

### 5.4 UI设计原则

- 简洁直观的用户界面
- 合理的信息层级
- 清晰的视觉反馈
- 响应式设计，适配不同设备
- 符合现代Web设计规范

## 6. 使用说明

### 6.1 生成字帖

#### 6.1.1 通过文字输入生成
1. 在文字输入框中输入要生成的文字内容
2. 选择所需的字体（行楷、楷书、楷体、宋体、衬线体）
3. 选择纸张大小（A4、A3、B5）
4. 调整字体样式：
   - 使用滑块调整字体大小（20%-200%）
   - 点击颜色选择器选择字体颜色
   - 使用滑块调整字体透明度（30%-100%）
   - 如需描红练习，可开启"中空文字"开关
5. 调整格子样式：
   - 点击颜色选择器选择格子颜色
   - 使用滑块调整格子透明度（10%-100%）
   - 选择纸张样式（田字格、横线、米字格）
6. 点击"生成字帖"按钮，系统将根据配置生成字帖

#### 6.1.2 通过文件上传生成
1. 点击"选择文件"按钮，选择要上传的TXT或DOCX文件
2. 系统会自动将文件内容填充到文字输入框中
3. 根据需要调整字体、纸张大小和样式
4. 点击"生成字帖"按钮

**注意事项**：
- 文件大小不能超过1MB
- 仅支持TXT和DOCX格式
- DOCX文件中的图片和复杂格式将被忽略，只提取纯文本

### 6.2 导出PDF

1. 生成字帖后，点击"导出PDF"按钮
2. 页面中央会显示导出进度提示
3. 等待PDF生成完成（时间取决于页面数量和复杂度）
4. 浏览器会自动下载生成的PDF文件，文件名为"calligraphy.pdf"

**导出优化建议**：
- 对于大量页面（超过20页），建议分批生成和导出
- 确保浏览器允许弹出下载窗口
- 如果导出失败，可尝试刷新页面后重新生成字帖

### 6.3 高级功能

#### 6.3.1 强制分页
在输入文字时，可使用特殊字符`#`进行强制分页。例如：
```
第一页内容
#
第二页内容
```

#### 6.3.2 换行处理
输入文字中的换行符会被保留，用于重置当前行的列位置，但不会导致提前分页。

## 7. 扩展与改进

### 7.1 功能扩展

#### 7.1.1 字体扩展
- **目标**：支持更多字体选择，包括自定义字体上传
- **实现思路**：
  - 集成Google Fonts或其他外部字体库
  - 添加自定义字体上传功能，支持TTF、OTF格式
  - 实现字体预览功能
- **预期效果**：用户可以使用自己喜欢的任意字体生成字帖

#### 7.1.2 纸张样式扩展
- **目标**：添加更多纸张样式和自定义样式功能
- **实现思路**：
  - 增加回宫格、米字格等更多传统书法格子样式
  - 支持用户自定义格子线数量和样式
  - 添加背景图片上传功能
- **预期效果**：提供更丰富的纸张样式选择，满足不同书法练习需求

#### 7.1.3 自定义纸张尺寸
- **目标**：支持用户自定义纸张尺寸
- **实现思路**：
  - 添加纸张尺寸输入框，允许用户输入宽度和高度
  - 动态计算自定义尺寸下的行列数
  - 支持保存常用自定义尺寸
- **预期效果**：用户可以根据需要生成任意尺寸的字帖

#### 7.1.4 文字排版优化
- **目标**：提供更灵活的文字排版功能
- **实现思路**：
  - 添加文字对齐方式选择（左对齐、居中、右对齐）
  - 支持行间距和字间距调整
  - 实现文字旋转功能
- **预期效果**：用户可以更精确地控制文字在格子中的位置和排版

#### 7.1.5 配置保存与加载
- **目标**：支持用户保存和加载配置
- **实现思路**：
  - 使用localStorage或IndexedDB保存用户配置
  - 实现配置导入导出功能
  - 提供预设配置模板
- **预期效果**：用户可以保存常用配置，提高使用效率

### 7.2 性能优化

#### 7.2.1 大文件处理优化
- **目标**：优化大文件（超过1MB）的处理速度和内存占用
- **实现思路**：
  - 实现文件分片上传和处理
  - 使用Web Worker在后台处理大文件
  - 增加文件处理进度提示
- **预期效果**：流畅处理更大尺寸的文件，提高用户体验

#### 7.2.2 PDF导出优化
- **目标**：提高PDF导出速度和质量
- **实现思路**：
  - 优化html2canvas配置，平衡速度和质量
  - 实现异步并发处理多页PDF
  - 添加PDF质量和压缩级别选择
- **预期效果**：更快的PDF导出速度，更小的文件体积

#### 7.2.3 懒加载与虚拟滚动
- **目标**：优化大量页面的渲染性能
- **实现思路**：
  - 实现虚拟滚动，只渲染可视区域的页面
  - 采用懒加载方式加载非可视区域的内容
  - 优化DOM结构，减少重排重绘
- **预期效果**：流畅渲染大量页面（100+页），减少内存占用

### 7.3 界面改进

#### 7.3.1 移动端体验优化
- **目标**：提高移动端的使用体验
- **实现思路**：
  - 优化触摸交互，增加触摸反馈
  - 改进移动端表单布局
  - 添加移动端专用操作按钮
- **预期效果**：在移动设备上使用更流畅、更易用

#### 7.3.2 主题切换
- **目标**：支持多种主题切换
- **实现思路**：
  - 实现明暗主题切换
  - 支持自定义主题颜色
  - 使用CSS变量实现主题切换
- **预期效果**：用户可以根据自己的喜好选择主题，减少视觉疲劳

#### 7.3.3 动画效果
- **目标**：添加适当的动画效果，提升用户体验
- **实现思路**：
  - 添加表单交互动画
  - 实现页面切换动画
  - 增加生成和导出过程的动画反馈
- **预期效果**：更生动的用户界面，更好的视觉反馈

### 7.4 其他改进方向

- **多语言支持**：添加中文、英文等多种语言支持
- **在线分享功能**：支持生成分享链接，分享生成的字帖
- **社区功能**：允许用户分享和下载他人生成的字帖
- **数据分析**：添加使用统计和数据分析功能
- **API接口**：提供RESTful API，支持第三方集成

## 8. 开发与构建

### 8.1 开发环境配置

#### 8.1.1 系统要求
- Node.js 16.x 或更高版本
- npm 7.x 或更高版本
- 现代浏览器（Chrome 90+、Firefox 88+、Safari 14+、Edge 90+）

#### 8.1.2 安装依赖
```bash
# 安装项目依赖
npm install
```

### 8.2 开发模式

#### 8.2.1 启动开发服务器
```bash
npm run dev
```

开发服务器启动后，会在控制台显示访问地址，默认情况下为 `http://localhost:5173`

#### 8.2.2 开发服务器功能
- 热模块替换（HMR）：修改代码后自动刷新页面
- 实时编译：自动编译React组件和CSS文件
- 错误提示：在浏览器和控制台显示详细的错误信息
- 资源映射：提供Source Map，便于调试

### 8.3 构建生产版本

#### 8.3.1 执行构建
```bash
npm run build
```

构建完成后，会在项目根目录生成 `dist` 文件夹，包含编译后的生产版本文件

#### 8.3.2 构建优化
- 代码压缩：压缩JavaScript、CSS和HTML文件
- 树摇优化：移除未使用的代码
- 按需加载：支持动态导入的组件按需加载
- 资源哈希：为静态资源添加哈希值，优化缓存

### 8.4 预览生产构建

```bash
npm run preview
```

预览服务器启动后，会在控制台显示访问地址，默认情况下为 `http://localhost:4173`

**注意**：预览服务器仅用于测试生产构建，不建议用于正式部署

### 8.5 调试技巧

#### 8.5.1 React DevTools
- 安装Chrome或Firefox浏览器的React DevTools扩展
- 可以查看组件树、状态和属性
- 支持组件性能分析

#### 8.5.2 浏览器开发者工具
- 使用Console面板查看日志和错误
- 使用Elements面板调试DOM和CSS
- 使用Network面板分析网络请求
- 使用Performance面板分析性能瓶颈

#### 8.5.3 调试PDF导出
- 可以在`exportPDF`函数中添加日志，查看导出进度
- 使用浏览器开发者工具的Memory面板监控内存使用
- 可以尝试调整html2canvas的配置参数，优化导出效果

### 8.6 代码规范

#### 8.6.1 ESLint
项目配置了ESLint，用于检查代码规范。可以通过以下命令运行：

```bash
npm run lint
```

#### 8.6.2 Prettier
项目配置了Prettier，用于格式化代码。可以通过以下命令运行：

```bash
npm run format
```

## 9. 浏览器兼容性

### 9.1 支持的浏览器

| 浏览器 | 最低版本 | 推荐版本 | 备注 |
|--------|----------|----------|------|
| Chrome | 90 | 最新版本 | 推荐使用，支持所有功能 |
| Firefox | 88 | 最新版本 | 支持所有功能 |
| Safari | 14 | 最新版本 | 支持所有功能，PDF导出可能较慢 |
| Edge | 90 | 最新版本 | 支持所有功能 |
| 移动端Chrome | 90 | 最新版本 | 响应式设计，优化触摸体验 |
| 移动端Safari | 14 | 最新版本 | 响应式设计，优化触摸体验 |

### 9.2 功能兼容性

| 功能 | Chrome | Firefox | Safari | Edge |
|------|--------|---------|--------|------|
| 文字输入 | ✅ | ✅ | ✅ | ✅ |
| 文件上传 | ✅ | ✅ | ✅ | ✅ |
| 字体选择 | ✅ | ✅ | ✅ | ✅ |
| 样式调整 | ✅ | ✅ | ✅ | ✅ |
| 字帖生成 | ✅ | ✅ | ✅ | ✅ |
| PDF导出 | ✅ | ✅ | ⚠️ | ✅ |

**注意**：Safari浏览器的PDF导出功能可能较慢，建议使用Chrome或Firefox浏览器获得最佳体验

## 10. 许可证

### 10.1 项目许可证

本项目采用MIT许可证，详细内容如下：

```
MIT License

Copyright (c) 2025 字帖生成器项目

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### 10.2 依赖许可证

| 依赖 | 许可证 |
|------|--------|
| React | MIT |
| Vite | MIT |
| jsPDF | MIT |
| html2canvas | MIT |
| mammoth.js | MIT |

## 11. 贡献指南

### 11.1 贡献流程

1. Fork项目仓库
2. 创建特性分支 `git checkout -b feature/AmazingFeature`
3. 提交更改 `git commit -m 'Add some AmazingFeature'`
4. 推送到分支 `git push origin feature/AmazingFeature`
5. 提交Pull Request

### 11.2 代码规范

- 遵循ESLint和Prettier配置
- 提交代码前运行 `npm run lint` 和 `npm run format`
- 为新增功能添加适当的注释
- 确保所有功能正常工作

### 11.3 报告问题

如果您发现任何问题或有改进建议，请通过以下方式报告：

1. 提交GitHub Issue，包含详细的问题描述和重现步骤
2. 提供浏览器版本、操作系统等环境信息
3. 如果可能，提供截图或错误日志

## 12. 联系方式

如有问题或建议，欢迎通过以下方式联系：

- 项目仓库：[GitHub Repository]()
- 电子邮件：[dylyoux@163.com]()
- 注意：本项目完全由AI生成！！！

## 13. 更新日志

### 1.0.0 (2025-12-05)

- 初始版本发布
- 支持文字输入和文件上传
- 支持5种字体选择
- 支持3种纸张尺寸
- 支持多种纸张样式
- 支持PDF导出功能
- 优化PDF导出速度
- 增加中空文字效果
- 优化响应式设计
- 修复已知bug
- 增加更多纸张样式
- 优化文件上传处理
- 改进UI设计
- 修复已知bug
