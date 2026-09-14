# 首页改版工作日志（redesign-home 分支）

> 本文档是跨会话/跨设备的交接说明。任何新会话接手前先读完本文档。
> 改版原则：**一小块一小块做，每块做完用户过目确认 → commit + push → 再进下一块。**

## 一、项目背景

- 改版对象：`yl-doc`（VitePress 1.6 + vitepress-theme-teek 1.5）的首页
- 分支：`redesign-home`（从 master 拉出），master 上是旧版首页
- 产品本体：`yl-editor`（工作区兄弟目录，Path of Exile 过滤器在线编辑器，edit.filtereditor.cn）
- 首页内容基于 yl-editor 真实功能（POE1/POE2 编辑页为核心），**不受编辑器 UI 风格影响**（编辑器只是 Naive UI 组件库堆的，无特殊风格）
- 用户设备偏好：桌面用户为主（编辑器要求桌面 Chrome/Edge），移动端策略 = 排版适配 + 动画从简（不做交互级动画适配）

## 二、设计定案（已拍板，不要重新讨论）

- **风格 A「暗金 ARPG × 编辑器语法」**：近黑底 + 金橙主色（品牌色 #E8A23C）+ POE 稀有度色板点缀；等宽过滤代码作装饰纹理；功能卡做成"游戏物品名牌"形态。排版克制、大留水。设计语言取自游戏与编辑器本身（物品名牌、T 档配色、光束、地图钉、Show/Hide 语法）
- **首页固定深色**：进入首页强制 `html.dark` + 隐藏导航栏明暗切换按钮（`html.yl-home-active .VPNavBarAppearance { display: none }`），离开恢复用户原主题。不做亮色版首页
- **移动端**：不做"套旧版"，新首页响应式；GSAP 动画在移动端呈现静态终态（`gsap.matchMedia`）
- **动画库**：gsap 3.15（已装，3.13+ 插件全免费），SSG 环境所有 GSAP 代码只在 `onMounted` 跑

### 页面结构蓝图（7 段）

```
01 Hero          主视觉：入场动画 + 双CTA(打开编辑器/下载懒人包) + 数据带(163,294位流放者 + POE1 v3.29.2 / POE2 v2.0.8 双版本徽章)
02 签名叙事区     满屏混乱掉落 → 过滤生效 → T档分层；先做 before/after 滑杆版，后续可升级滚动叙事(scrub)
03 功能长廊       五幕交替式大区块：物价自动排序 → 所见即所得编辑(复刻 preview-block) → 官网云同步 → 自动更新(五类差异合并) → POE2 规划器(10类通货tab轮播)
04 Bento 速览    主题市场/色板库/本地直读直写/纯净模式/音效包(妹妹音效可hover试听)，不对称bento + hover微倾斜发光
05 社区生态带     QQ群/B站12集教程/定制服务/biubiu合作位 → 横向生态带（不再占主视觉）
06 CTA 终章      大字 + 光束汇聚 + 双按钮 + 版本公告
```

## 三、当前状态

**✅ 已完成：地基（第 1 块）**，验证全通过（桌面/构建/移动390px无溢出/明暗三态切换）

| 文件 | 作用 |
|---|---|
| `docs/.vitepress/theme/components/home/styles/tokens.scss` | 全部设计 token：底色/金橙/稀有度色板/语法高亮/字体/间距/圆角/动效变量 + `yl-container`、`yl-item-label` mixin。**改风格只动这里** |
| `docs/.vitepress/theme/components/home/HomePage.vue` | 容器：挂 token、全宽覆盖(.VPContent:has(.yl-home))、强制深色+隐藏明暗按钮、顶部金色氛围光晕、区块公共空壳样式 |
| `docs/.vitepress/theme/components/home/sections/*.vue` | 6 个区块空壳（HeroSection/Signature/Features/Bento/Community/Cta），带锚点 id，逐块替换内容 |
| `docs/index.md` | `layout: page` + `<HomePage />`；旧首页在 git 历史（master） |
| `docs/.vitepress/theme/index.ts` | enhanceApp 全局注册 HomePage |
| `docs/.vitepress/teekConfig.ts` | 用户改了 `notice.initOpen: false`（公告不再自动弹） |

**➡️ 下一步：02 Hero** —— 入场动画（SplitText 逐字 + 光晕）、双 CTA、数据带（数字滚动 count-up，API `/api/v1/user/count` 走 dev 代理，返回 `{data: 163294}`）、双版本徽章；把金色光晕向上延伸到导航栏底下让毛玻璃透光。

**后续队列**：03 签名叙事（滑杆版）→ 04 功能长廊（五幕逐个做，每幕可能是独立的小验收）→ 05 Bento → 06 社区生态带 → 07 CTA 终章 + 全页联动检查。

**每块验收标准（三态）**：桌面全动画 / 移动端排版正确+动画静态或轻量 / `prefers-reduced-motion` 直接终态。

## 四、注意事项（踩过的坑）

1. **dev server**：用户自己起在 **5173** 端口，AI 检查一律用 `http://localhost:5173/`，**不要**另起 5273
2. **构建日志里的 `localStorage is not defined`（约37次）是 Teek 主题的 SSR 噪音**，stash 验证过与本次改版无关，忽略
3. VitePress 是 SSG：GSAP/DOM 代码全部放 `onMounted`；公告弹窗若要内容更新在 `NoticeContent.vue`
4. 右下角 Teek 自带浮动按钮（统计相关）在首页转圈，计划在 Hero 阶段统一隐藏/收纳首页浮动元素
5. 亮色偏好用户直开首页理论上有"导航先亮后暗"一瞬，观感明显再加内联脚本纠正
6. `docs/` 下的 .md 都会被构建成线上页面，开发文档放 `docs/.vitepress/` 下（本文件因此在这里）
7. 首页旧内容（QQ群/广告/用户数）已从 index.md 移除，将在 04/05/06 区块中以新形态回归
8. 素材来源：物品图标/命运卡图/掉落地面图从 `yl-editor` 的 public 与组件资产里拿（POE1/PO2 双套图标在 `yl-editor/src/data/category.ts` 体系）

## 五、改动记录（按块追加）

### 2026-09-14 · 地基（第1块）

- 新建 `home/` 组件目录：tokens.scss + HomePage.vue + 6 个 section 空壳
- `index.md` → `layout: page` + `<HomePage />`；theme/index.ts 注册组件
- 安装 `gsap@3.15.0`
- 全宽覆盖、强制深色、隐藏首页明暗切换（`yl-home-active` 机制）、顶部金色氛围光晕（已实测可见）
- 用户改动：teekConfig 公告 `initOpen: false`
