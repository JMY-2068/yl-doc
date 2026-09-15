<template>
    <section id="features" class="yl-feat">
        <!-- 区块大标题 -->
        <div class="yl-feat__head">
            <p class="yl-feat__kicker">03 / FEATURES</p>
            <h2 class="yl-feat__head-title">一乐过滤能做什么？</h2>
        </div>

        <!-- 五幕依次向下；每幕独立组件，布局左右交替 -->
        <VisualEditAct />
        <PriceSortAct />
    </section>
</template>

<script setup lang="ts">
import VisualEditAct from "./features/VisualEditAct.vue"
import PriceSortAct from "./features/PriceSortAct.vue"
</script>

<style scoped lang="scss">
.yl-feat {
    padding: var(--yl-space-section) 0 0;
}

.yl-feat__head {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    text-align: center;
    padding: 0 var(--yl-space-content);
    margin-bottom: clamp(40px, 6vh, 72px);
}

.yl-feat__kicker {
    font-family: var(--yl-font-mono);
    font-size: 13px;
    letter-spacing: 0.22em;
    color: var(--yl-gold);
}

.yl-feat__head-title {
    font-family: var(--yl-font-display);
    font-weight: 900;
    font-size: clamp(28px, 4vw, 44px);
    color: var(--yl-text-primary);
}
</style>
