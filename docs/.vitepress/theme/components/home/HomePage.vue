<template>
    <div class="yl-home">
        <HeroSection />
        <SignatureSection />
        <FeaturesSection />
        <BentoSection />
        <CommunitySection />
        <CtaSection />
    </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted } from "vue"
import HeroSection from "./sections/HeroSection.vue"
import SignatureSection from "./sections/SignatureSection.vue"
import FeaturesSection from "./sections/FeaturesSection.vue"
import BentoSection from "./sections/BentoSection.vue"
import CommunitySection from "./sections/CommunitySection.vue"
import CtaSection from "./sections/CtaSection.vue"

// 首页固定深色叙事：强制深色 + 隐藏导航栏明暗切换按钮，离开时恢复用户原有主题
let forcedDark = false
onMounted(() => {
    const root = document.documentElement
    root.classList.add("yl-home-active")
    if (!root.classList.contains("dark")) {
        root.classList.add("dark")
        forcedDark = true
    }
})
onBeforeUnmount(() => {
    const root = document.documentElement
    root.classList.remove("yl-home-active")
    if (forcedDark) root.classList.remove("dark")
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
        radial-gradient(1100px 520px at 50% 0%, rgba(232, 162, 60, 0.18), transparent 60%),
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
</style>
