<template>
    <section id="features" ref="root" class="yl-feat">
        <!-- 区块大标题 -->
        <div ref="head" class="yl-feat__head">
            <p class="yl-feat__kicker" data-rise>03 / FEATURES</p>
            <h2 class="yl-feat__head-title" data-rise style="--d: 0.08s">一乐过滤能做什么？</h2>
        </div>

        <!-- 七幕依次向下；每幕独立组件，布局左右交替 -->
        <VisualEditAct />
        <CloudSaveAct />
        <PriceSortAct />
        <PlannerAct />
        <EquipPlanAct />
        <ThemeAct />
        <CloudSyncAct />
    </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue"
import VisualEditAct from "./features/VisualEditAct.vue"
import CloudSaveAct from "./features/CloudSaveAct.vue"
import PriceSortAct from "./features/PriceSortAct.vue"
import PlannerAct from "./features/PlannerAct.vue"
import EquipPlanAct from "./features/EquipPlanAct.vue"
import ThemeAct from "./features/ThemeAct.vue"
import CloudSyncAct from "./features/CloudSyncAct.vue"

const root = ref<HTMLElement>()
const head = ref<HTMLElement>()

let io: IntersectionObserver | undefined
let riseFallback: ReturnType<typeof setTimeout> | undefined

function riseIn() {
    root.value?.classList.add("is-in")
}

onMounted(() => {
    if (!root.value) return
    // 大标题进场：淡入 + 上浮（同各幕 data-rise 体系，js-anim 由 JS 添加，无 JS 时保持可见）
    root.value.classList.add("js-anim")
    io = new IntersectionObserver(
        (entries) => {
            if (entries.some(e => e.isIntersecting)) {
                // 双 rAF：先让隐藏初始态绘制一帧再触发过渡，修复"载入时已在视口内→无动画直接显示"
                requestAnimationFrame(() => requestAnimationFrame(riseIn))
                io?.disconnect()
            }
        },
        { threshold: 0.4 },
    )
    if (head.value) io.observe(head.value)
    // 兜底：仅在元素已进入视口却未收到 IO 回调时补触发，避免加载数秒后在屏幕外提前播完动画
    riseFallback = setTimeout(() => {
        const el = root.value
        if (el && !el.classList.contains("is-in")) {
            const r = el.getBoundingClientRect()
            if (r.top < innerHeight && r.bottom > 0) riseIn()
        }
    }, 3000)
})

onBeforeUnmount(() => {
    io?.disconnect()
    if (riseFallback) clearTimeout(riseFallback)
})
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

/* —— 进场：淡入 + 上浮（对齐 Hero 副标题的进入手感） —— */
.yl-feat.js-anim [data-rise] {
    opacity: 0;
    transform: translateY(24px);
}

.yl-feat.js-anim.is-in [data-rise] {
    opacity: 1;
    transform: none;
    /* 注意：本站构建管线会吃掉 transition 简写里的 var()，必须拆成 longhand */
    transition-property: opacity, transform;
    transition-duration: 0.65s;
    transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
    transition-delay: var(--d, 0s);
}
</style>
