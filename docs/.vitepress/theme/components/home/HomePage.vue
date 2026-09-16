<template>
    <div class="yl-home">
        <HeroSection />
        <SignatureSection />
        <WhySection />
        <FeaturesSection />
        <BentoSection />
        <CommunitySection />
        <CtaSection />
        <!-- 页脚三件（版权 / 主题 / 备案）：layout:page 不带 Teek 页脚，此处镜像 teekConfig.footerInfo 与 Teek 页脚原文案（改动需两处同步）；图标/版本/主题链接复用 Teek 包内置资源 -->
        <footer class="yl-home__footer">
            <span class="yl-home__footer-item"><i class="yl-home__footer-ic" aria-hidden="true" v-html="copyrightIcon" />Copyright {{ yearRange }} 一乐过滤</span>
            <a class="yl-home__footer-item" href="https://github.com/Kele-Bingtang/vitepress-theme-teek" target="_blank" rel="noopener"><i class="yl-home__footer-ic" aria-hidden="true" v-html="themeIcon" />Theme By Teek@{{ version }}</a>
            <a class="yl-home__footer-item" href="http://beian.miit.gov.cn/" target="_blank" rel="noopener"><i class="yl-home__footer-ic" aria-hidden="true" v-html="icpRecordIcon" />苏ICP备2021052248号-2</a>
        </footer>
        <!-- Waypoint 传送点导航（桌面右侧固定） -->
        <WaypointNav />
        <!-- 抓魔镜彩蛋（桌面鼠标设备） -->
        <MirrorEgg />
    </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted } from "vue"
import HeroSection from "./sections/HeroSection.vue"
import SignatureSection from "./sections/SignatureSection.vue"
import WhySection from "./sections/WhySection.vue"
import FeaturesSection from "./sections/FeaturesSection.vue"
import BentoSection from "./sections/BentoSection.vue"
import CommunitySection from "./sections/CommunitySection.vue"
import CtaSection from "./sections/CtaSection.vue"
import WaypointNav from "./WaypointNav.vue"
import MirrorEgg from "./MirrorEgg.vue"
// Teek 页脚同款图标（包内置 SVG 字符串，默认导出）
import copyrightIcon from "vitepress-theme-teek/es/static/icons/copyright.mjs"
import themeIcon from "vitepress-theme-teek/es/static/icons/theme.mjs"
import icpRecordIcon from "vitepress-theme-teek/es/static/icons/icpRecord.mjs"
// 主题版本号：与 teekConfig 同源，主题升级自动跟随
import { version } from "vitepress-theme-teek/es/version"

// 页脚版权年份：起始 2025（同 teekConfig.createYear），跨年显示区间
const now = new Date().getFullYear()
const yearRange = now > 2025 ? `2025-${now}` : "2025"

// 首页固定深色叙事：强制深色 + 隐藏导航栏明暗切换按钮，离开时恢复用户原有主题
let forcedDark = false

// 主题自带的 a11y 重置会在 prefers-reduced-motion: reduce 时把全站 transition/animation
// 时长压成 0（* !important）。用户定：首页动画无条件执行（2026-09-15）——
// 进入首页时停用该媒体规则，离开时原样恢复。
let disabledMediaRules: { rule: CSSMediaRule; text: string }[] = []

function disableThemeReducedMotionReset() {
    for (const sheet of document.styleSheets) {
        let rules: CSSRuleList
        try {
            rules = sheet.cssRules
        } catch {
            continue
        }
        for (const r of rules) {
            if (!(r instanceof CSSMediaRule)) continue
            if (!r.media.mediaText.includes("prefers-reduced-motion")) continue
            // 只停用命中 * 全局重置（含 transition-duration: 0s）的那条，不动组件级降级
            const isGlobalReset = [...r.cssRules].some(x => /transition-duration:\s*0/i.test(x.cssText) && /\*\s*,/.test(x.cssText))
            if (isGlobalReset) {
                disabledMediaRules.push({ rule: r, text: r.media.mediaText })
                r.media.mediaText = "not all"
            }
        }
    }
}

onMounted(() => {
    const root = document.documentElement
    root.classList.add("yl-home-active")
    if (!root.classList.contains("dark")) {
        root.classList.add("dark")
        forcedDark = true
    }
    disableThemeReducedMotionReset()
})

onBeforeUnmount(() => {
    const root = document.documentElement
    root.classList.remove("yl-home-active")
    if (forcedDark) root.classList.remove("dark")
    for (const { rule, text } of disabledMediaRules) {
        rule.media.mediaText = text
    }
    disabledMediaRules = []
})
</script>

<style lang="scss">
@use "./styles/tokens" as *;

.yl-home {
    // 设计 token 挂载点，后代区块只消费变量
    @include yl-tokens;

    position: relative;
    min-height: 100vh;
    background:
        radial-gradient(1100px 520px at 50% 0%, rgba(232, 162, 60, 0.1), transparent 60%),
        var(--yl-bg);
    color: var(--yl-text-primary);
    font-family: var(--yl-font-body);
    overflow-x: clip;
}

/* —— 区块空壳的公共形态（正式内容逐块替换后由各区块自带样式接管）—— */
.yl-home .yl-section {
    position: relative;
    min-height: 60vh;
    padding: var(--yl-space-section) var(--yl-space-content);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 18px;
    text-align: center;
}

.yl-home .yl-section + .yl-section {
    border-top: 1px dashed var(--yl-border);
}

.yl-home .yl-section__index {
    font-family: var(--yl-font-mono);
    font-size: 13px;
    letter-spacing: 0.22em;
    color: var(--yl-gold);
}

.yl-home .yl-section__title {
    font-family: var(--yl-font-display);
    font-weight: 900;
    font-size: clamp(28px, 4vw, 44px);
    letter-spacing: 0.04em;
    color: var(--yl-text-primary);
}

.yl-home .yl-section__desc {
    max-width: 620px;
    line-height: 1.8;
    color: var(--yl-text-secondary);
}

/* —— 首页全宽：解除 VitePress page 布局的容器限制 —— */
.VPContent:has(.yl-home) {
    .VPPage,
    .container,
    .content {
        max-width: none;
        padding: 0;
        margin: 0;
    }
}

/* —— 首页固定深色：隐藏导航栏明暗切换按钮（桌面/移动端全部实例）—— */
html.yl-home-active .VPNavBarAppearance {
    display: none;
}

/* —— 首页隐藏 Teek 悬浮件：公告铃铛 / 壁纸按钮（回顶按钮与壁纸同容器，只藏壁纸那颗）—— */
html.yl-home-active .tk-notice__icon,
html.yl-home-active .tk-right-bottom-button__button:not(.back-top) {
    display: none;
}

/* —— 页脚三件（版权 / 主题 / 备案），风格并入首页暗色 —— */
.yl-home__footer {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px 26px;
    padding: 26px var(--yl-space-content) 30px;
    border-top: 1px dashed var(--yl-border);
    font-size: 12px;
    color: var(--yl-text-faint);
    text-align: center;
}

.yl-home__footer-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--yl-text-faint);
}

a.yl-home__footer-item {
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
        color: var(--yl-gold-bright);
    }
}

.yl-home__footer-ic {
    display: inline-flex;
    flex-shrink: 0;

    /* Teek 原图标 svg 带 width/200 属性且部分 path 无 fill，统一接管尺寸与颜色 */
    svg {
        width: 14px;
        height: 14px;
        fill: currentColor;
    }
}
</style>
