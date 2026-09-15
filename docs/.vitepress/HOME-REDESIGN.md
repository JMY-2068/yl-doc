# 首页改版工作日志（redesign-home 分支）

> 本文档是跨会话/跨设备的交接说明。任何新会话接手前先读完本文档。
> 改版原则：**一小块一小块做，每块做完用户过目确认 → commit + push → 再进下一块。**
> commit/push 一律由用户自己执行，AI 不主动提交，只提供提交信息（2026-09-15 用户定）。

## 一、项目背景

- 改版对象：`yl-doc`（VitePress 1.6 + vitepress-theme-teek 1.5）的首页
- 分支：`redesign-home`（从 master 拉出），master 上是旧版首页
- 产品本体：`yl-editor`（工作区兄弟目录，Path of Exile 过滤器在线编辑器，edit.filtereditor.cn）
- 首页内容基于 yl-editor 真实功能（POE1/POE2 编辑页为核心），**不受编辑器 UI 风格影响**（编辑器只是 Naive UI 组件库堆的，无特殊风格）
- 用户设备偏好：桌面用户为主（编辑器要求桌面 Chrome/Edge），移动端策略 = 排版适配 + 动画从简（不做交互级动画适配）

## 二、设计定案（已拍板，不要重新讨论）

- **风格 A「暗金 ARPG × 编辑器语法」**：近黑底 + 金橙主色（品牌色 #E8A23C）+ POE 稀有度色板点缀；等宽过滤代码作装饰纹理；功能卡做成"游戏物品名牌"形态。排版克制、大留水。设计语言取自游戏与编辑器本身（物品名牌、T 档配色、光束、地图钉、Show/Hide 语法）
- **首页固定深色**：进入首页强制 `html.dark` + 隐藏导航栏明暗切换按钮（`html.yl-home-active .VPNavBarAppearance { display: none }`），离开恢复用户原主题。不做亮色版首页
- **移动端**：不做"套旧版"，新首页响应式；排版适配 + 动画从简（不做交互级动画适配）
- **动画与系统动效偏好（2026-09-15 定）**：**不读 `prefers-reduced-motion`，任何系统设置下动画一律执行**（起因：用户公司 Win11 关闭「辅助功能-动画效果」，浏览器上报 reduce，页面动画全部消失）。**后续所有区块禁止新增该判定**，验收不再有"减少动效"态
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

**✅ 已完成：02 Hero（第 2 块，用户已验收定稿）**

最终结构（`HeroSection.vue`，全部细节以代码为准）：

- **内容纵列**：logo（/logo.webp，圆角+金色投影，入场第一个：缩放淡入）→ 大标题「一乐过滤」（SplitText 拆字逐字上浮）→ 金色渐变下划线（scaleX 从中间展开，4px 带辉光）→ 两行副标题（`国服最好用的过滤编辑工具` 大亮 / `简单、高效、灵活、高度自定义` 小灰）→ 三按钮（金色实底「打开编辑器」→edit.filtereditor.cn；描边「下载懒人包」→/download.html；描边「先看教程」→/base/intro.html）→ 数据带两行（`已有 N 位流放者加入` 17px/数字22px 金色 mono；版本行 `POE1 v3.29.2` `POE2 v2.0.8` = 金色小圆点+16px粗金色mono纯文本，非按钮样式）→ 底部 SCROLL 呼吸线
- **用户数**：SSR 初始为 0（避免"先显示最大值再归零"闪烁），入场末尾 fetch：`/api/v1/user/count` → 失败回退 `https://api.filtereditor.cn/prod/v1/user/count` → 再失败显示 "160,000+"；成功则 1.6s count-up
- **背景三件套**：① 锚定光晕（720×440 居中在 logo+标题后方，光有落点不显脏）；② 金色浮尘（JS 注入，桌面16颗/移动8颗，上浮淡出循环）；③ **7 个真实过滤掉落物名牌**（左列4：卡兰德的魔镜/毁灭者之弓/重革腰带/崇高石；右列3：神圣石/贪婪战书/高级混沌石），配色/字号取自用户真实过滤规则（游戏字号×0.32），数据驱动（`leftDrops/rightDrops` 数组：name/text/bg/border/fs/beam/dx/mt/bh）
- **掉落演出**：入场时依次从上方70px加速砸落（间隔0.22s）→ 落地名牌挤压回弹（elastic）→ 光柱从底部迸发；全部落定后 `tl.eventCallback("onComplete")` 启动待机（左右组漂浮 + 光柱错峰呼吸），避免与入场争夺 opacity
- **光柱三层结构**：炽亮核心（混白渐变+双辉光）/ 宽柔光锥（clip-path 收窄 + blur + CSS 呼吸）/ 底部椭圆光斑；颜色衍生 `mixWhite()` 计算 --beam-core
- **散落感**：每颗名牌独立 dx（水平偏移）/mt（垂直错落）/bh（光柱高度），打破垂直堆叠
- 名牌布局 <960px 隐藏；动画不读 `prefers-reduced-motion`（2026-09-15 起无条件执行）

| 文件 | 作用 |
|---|---|
| `docs/.vitepress/theme/components/home/styles/tokens.scss` | 全部设计 token：底色/金橙/稀有度色板/语法高亮/字体/间距/圆角/动效变量 + `yl-container`、`yl-item-label` mixin。**改风格只动这里** |
| `docs/.vitepress/theme/components/home/HomePage.vue` | 容器：挂 token、全宽覆盖(.VPContent:has(.yl-home))、强制深色+隐藏明暗按钮、顶部金色氛围光晕、区块公共空壳样式 |
| `docs/.vitepress/theme/components/home/sections/*.vue` | 6 个区块空壳（HeroSection/Signature/Features/Bento/Community/Cta），带锚点 id，逐块替换内容 |
| `docs/index.md` | `layout: page` + `<HomePage />`；旧首页在 git 历史（master） |
| `docs/.vitepress/theme/index.ts` | enhanceApp 全局注册 HomePage |
| `docs/.vitepress/teekConfig.ts` | 用户改了 `notice.initOpen: false`（公告不再自动弹） |

**✅ 已完成：03 签名叙事区（第 3 块，用户已验收；区块文案用户明天自行优化）**

`SignatureSection.vue`，双模式同组件共存，共用一套真实物品数据：

- **真实场景数据（用户提供）**：21 个物品（粗制弓/毁灭者之弓/锈蚀胸甲/邪恶束衣/重革腰带/金光戒指/先祖冠冕/卡兰德的魔镜/神圣石/混沌石/崇高石/高级工匠石/富豪石/蜕变石碎片/引路石16阶/未切割技能宝石等级20/红玉/贪婪战书/梦魇拟像裂片/先祖密藏日志/万用腰带），颜色/字号/光柱/小地图图标全部取自真实过滤规则（字号 ×0.32）；无过滤态默认样式 `SetTextColor 150 141 121 / SetBackgroundColor 13 12 10`；粗制弓/锈蚀胸甲/蜕变石碎片 3 个过滤后隐藏；5 道光柱；13 个小地图图标热链 `https://edit.filtereditor.cn/images/drop/icon_{Shape}{Color}.png`（三档 18/14/11px）
- **滚动叙事模式**（桌面 ≥960px）：区块高 320vh，CSS `position: sticky`（不用 ST pin，更稳）钉住舞台；ScrollTrigger 只算进度 → `sweep` 0~108 驱动金色扫描线（带 Show 标记）从左往右；扫到的灰字名牌逐个坠落淡出（左右交错倾角），值钱名牌原地点亮（缩放浮现 + 光柱 scaleY 升起），三段文案随进度切换，完全可逆
- **滑杆模式**（移动端）：双层反向 clip-path（`inset(0 0 0 pos)` / `inset(0 calc(100%-pos) 0 0)`），向右拖=过滤从左往右生效，钳制 1%~99%
- 物品纵向分布 14%~78%（用户要求的紧凑度），18 个过滤后名牌零重叠
- **待办**：区块文案（标题/描述/三段推进文案 `phases` 数组）用户明天优化

**➡️ 下一步：04 功能长廊** —— 五幕交替式大区块（sticky 图文交替）：物价自动排序 → 所见即所得编辑 → 官网云同步 → 自动更新 → POE2 规划器。每幕独立小验收。

**备选想法（讨论过未做）**：把旧首页的手绘涂鸦下划线 SVG path 搬进 Hero，用 DrawSVG（gsap 3.13+ 免费）做描边动画替换现在的直线下划线——用户已知悉，想做随时可加。

**后续队列**：05 Bento → 06 社区生态带 → 07 CTA 终章 + 全页联动检查。

**每块验收标准（两态）**：桌面全动画 / 移动端排版正确+动画轻量。（2026-09-15 起不读 `prefers-reduced-motion`，见设计定案；原"减少动效直接终态"态作废）

## 四、注意事项（踩过的坑）

1. **dev server**：用户自己起在 **5173** 端口，AI 检查一律用 `http://localhost:5173/`，**不要**另起 5273
2. VitePress 是 SSG：GSAP/DOM 代码全部放 `onMounted`；公告弹窗若要内容更新在 `NoticeContent.vue`
3. 右下角 Teek 悬浮件隐藏有坑：**回顶按钮（`.back-top`）和壁纸按钮在同一个容器 `.tk-right-bottom-button` 里**，只能藏 `.tk-right-bottom-button__button:not(.back-top)`，藏容器会连坐回顶；公告铃铛 `.tk-notice__icon` 单独藏。另：Teek 回顶只响应真实滚轮/平滑滚动，编程式瞬移滚动不算数（全站行为，验收时用滚轮）
4. **GSAP 坑（重要）**：嵌入式浏览器/后台标签页会节流 rAF，GSAP 默认 `lagSmoothing` 会让入场时间线"爬行"（数秒只走 2%），必须在 onMounted 里 `gsap.ticker.lagSmoothing(false)`，后续所有区块照做
5. **GSAP 坑 2**：待机循环动画（漂浮/呼吸）和入场动画会争夺同一元素的 opacity/transform——待机必须等入场结束再启动（`tl.eventCallback("onComplete", ...)`）
6. **ScrollTrigger 坑**：若 trigger 元素高度由 mode class 切换驱动（如签名区 320vh），必须在 `nextTick` DOM 更新后再 `ScrollTrigger.create` 并 `ScrollTrigger.refresh()`，否则进度区间按旧尺寸计算（症状：刚滚一点 progress 就冲满）；钉住优先用 CSS `position: sticky`，ST 只算进度，避免 pin-spacer 在 SSG 的各种坑
7. 构建噪音清单（均与本改版无关，忽略）：`localStorage is not defined` ×37（Teek）、`document is not defined` ×1（06.POE网址导航.md 页面脚本存量问题）
8. 版本号徽章（v3.29.2 / v2.0.8）目前写死在 HeroSection 模板里，未来可改为读 siteConfig 接口
9. 亮色偏好用户直开首页理论上有"导航先亮后暗"一瞬，观感明显再加内联脚本纠正
10. `docs/` 下的 .md 都会被构建成线上页面，开发文档放 `docs/.vitepress/` 下（本文件因此在这里）
11. 首页旧内容（QQ群/广告/用户数）已从 index.md 移除，将在 04/05/06 区块中以新形态回归
12. 素材来源：物品图标/命运卡图/掉落地面图从 `yl-editor` 的 public 与组件资产里拿（POE1/PO2 双套图标在 `yl-editor/src/data/category.ts` 体系）
13. **协作流程（用户定）**：视觉验收一律由用户自己做，AI 只做 DOM/数值程序化检查，不要派视觉审查子智能体（慢）；文档只记用户验收过的状态，每块做完先给用户看，OK 后再写入本文档；**commit/push 由用户自己执行，AI 不主动提交，只提供提交信息（2026-09-15 补充）**
14. 连续编辑文件时 Vite HMR 会整页热重载产生竞态假象（动画看似卡死），排查前先干净 reload 一次再下结论

## 五、改动记录（按块追加）

### 2026-09-14 · 地基（第1块）

- 新建 `home/` 组件目录：tokens.scss + HomePage.vue + 6 个 section 空壳
- `index.md` → `layout: page` + `<HomePage />`；theme/index.ts 注册组件
- 安装 `gsap@3.15.0`
- 全宽覆盖、强制深色、隐藏首页明暗切换（`yl-home-active` 机制）、顶部金色氛围光晕（已实测可见）
- 用户改动：teekConfig 公告 `initOpen: false`

### 2026-09-14 · 02 Hero（第2块，已验收）

- HeroSection 全量实现（入场时间线/SplitText/logo/双CTA/数据带/SCROLL/锚定光晕/金尘/7个过滤掉落物名牌+三层光柱+掉落演出），细节见上方"当前状态"
- HomePage：隐藏 Teek 悬浮件（公告铃铛/壁纸按钮，回顶保留）、基础顶部光晕降至 0.1
- 修复：GSAP lagSmoothing 爬行 bug（注意事项4）；待机与入场争夺 opacity（注意事项5）
- 用户反馈迭代（共 5 轮）：删眉题、教程改按钮、用户数 SSR 初始 0 消闪烁、副标题两行、版本徽章独立行且改为圆点+文本非按钮样式、回顶按钮恢复、SCROLL 加强、数据带字号加大、加 logo、大光圈改锚定光晕+金尘、代码碎片改真实过滤名牌、+3 个名牌（贪婪战书/重革腰带/毁灭者之弓）、名牌散落感（dx/mt/bh）
- 验收：桌面+移动程序化检查全绿（用户目视定稿）

### 2026-09-14 · 03 签名叙事区（第3块，已验收）

- SignatureSection 全量实现：真实过滤样本场景（21 物品/真实配色/13 图标/5 光柱）+ 桌面滚动叙事（sticky 钉住 320vh、扫描线扫过、垃圾坠落、原地点亮、三段文案、可逆）+ 移动端/减少动效滑杆降级（双层反向 clip）
- 迭代记录：从左往右揭示方向、无过滤态真实默认样式（150 141 121 / 13 12 10）、舞台加高至 660、光柱 3×52、双层反向裁切修复"垃圾未隐藏"bug、拉伸范围放开 1~99、纵向紧凑 14~78%、真实样本替换、滚动模式 ScrollTrigger nextTick 修复
- 待办：区块文案（phases 数量组）用户明天优化

### 2026-09-15 · 动画策略变更：无条件执行，不读系统 prefers-reduced-motion（已验收）

- 起因：用户公司电脑 Win11 关闭「辅助功能-动画效果」→ 浏览器上报 `prefers-reduced-motion: reduce` → 首页动画全部消失；用户要求动画无论系统设置一律执行，且**后续所有设置都遵循此需求**
- HeroSection：`mm.add` 条件从 `(prefers-reduced-motion: no-preference)` 改为恒真 `(min-width: 0px)`（保留 matchMedia 只为沿用统一 revert）；删掉 reduced 分支与两段 `@media (prefers-reduced-motion: reduce)` 禁用光柱呼吸/SCROLL 呼吸线的规则
- SignatureSection：scroll 模式门槛 `(min-width: 960px) and (prefers-reduced-motion: no-preference)` → `(min-width: 960px)`
- 程序化验证（本机真实上报 reduce 的环境下）：SplitText 拆字、7 名牌 GSAP 内联样式、SCROLL 呼吸 CSS 动画激活、签名区 `yl-sig--scroll` 320vh 全部正常
- **此后 04~07 所有区块一律遵守：不新增任何 prefers-reduced-motion 判定；验收标准由三态改为两态**
- 同日：用户数跳动提速（待用户目视）——`fetchCount` 改为挂载即并行请求；`.call` 从时间线末尾（≈3.5s）提前到数字行开始淡入处（`"<"` 位置，≈2.2s），数据就绪即跳，不再等掉落物演出播完
- 同日：协作规则变更——AI 不再主动 commit/push，只提供提交信息，由用户自己提交
