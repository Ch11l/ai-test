---
description: 启动 UI/UX Pro Max 极速升级协议 - 将当前项目打造为顶尖中文应用体验
---

# UI/UX Pro Max 升级流程

本工作流旨在将现有项目提升至行业顶尖的设计标准。执行过程中必须严格遵守 **Antigravity Global Rules**，特别是**全中文界面**与**极致审美**原则。

## 1. 视觉与代码审计
- [ ] 读取 `App.vue` 及主要组件文件，分析当前布局结构。
- [ ] 检查 `index.css` 或 Tailwind 配置，确认当前的色彩系统与排版规范。
- [ ] **关键检查**: 确认所有界面文本是否已汉化。如果有英文（如 "Submit", "Task"），必须列入修改计划。

## 2. 设计升级 (Pro Max Mode)
- [ ] **配色重构**: 抛弃默认色板。引入一套现代化、高饱和度或高级灰的配色方案（建议参考 Linear, Vercel 或 顶级 Dribbble 设计）。
- [ ] **深度与质感**:
    - 为卡片和模态框添加多层阴影 (Box-shadow) 或 玻璃拟态 (Glassmorphism) 效果。
    - 确保背景色不是纯白 (#FFFFFF) 或 纯黑 (#000000)，而是带有色相的灰（如 #F5F7FA 或 #0F172A）。
- [ ] **排版优化**:
    - 确保中文字体优先（如 "Inter", "MiSans", "PingFang SC", "HarmonyOS Sans"）。
    - 增加行高 (line-height) 和字间距 (letter-spacing) 以提升可读性。

## 3. 动态交互注入
- [ ] **微交互 (Micro-interactions)**:
    - 按钮: Hover 时要有缩放 (scale) 或 亮度变化 (brightness)。
    - 输入框: Focus 时要有明显的光晕或边框动画。
- [ ] **状态过渡**:
    - 列表项的增删必须有 `TransitionGroup` 动画（如淡入淡出、滑入滑出）。
    - 页面加载或组件显现时应用 `v-show` / `v-if` 的过渡效果。

## 4. 执行与验证
- [ ] 修改代码，应用上述设计。
- [ ] 自我审查：
    - "这个页面能在 Dribbble 获得高分吗？"
    - "我的父母能一眼看懂这个全中文界面吗？"
- [ ] 如果通过审查，提交代码。

// turbo-all
