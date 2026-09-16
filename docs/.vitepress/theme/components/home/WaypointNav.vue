<template>
    <nav class="yl-way" :class="{ 'is-show': showRail }" aria-label="页面分区导航">
        <div class="yl-way__rail">
            <!-- 进度线：轨道虚线 + 金色填充（随滚动） -->
            <span class="yl-way__track" aria-hidden="true" />
            <span class="yl-way__fill" aria-hidden="true" :style="{ height: `calc((100% - 20px) * ${fill / 100})` }" />

            <template v-for="s in sections" :key="s.id">
                <button
                    :id="`yl-way-btn-${s.id}`"
                    type="button"
                    class="yl-way__node"
                :class="{ 'is-lit': visited.includes(s.id), 'is-cur': current === s.id }"
                :aria-label="`传送到 ${s.num} ${s.name}`"
                @click="travel(s.id)"
            >
                <svg class="yl-way__disc" viewBox="-90 -90 180 180" aria-hidden="true">
                    <!-- 当前态：旋转符环（虚线环 + 三菱标，整组旋转） -->
                    <g class="d-halo">
                        <circle r="84" />
                        <rect x="-3" y="-89" width="6" height="9" rx="1.5" />
                        <rect x="-3" y="-89" width="6" height="9" rx="1.5" transform="rotate(120)" />
                        <rect x="-3" y="-89" width="6" height="9" rx="1.5" transform="rotate(240)" />
                    </g>
                    <!-- 盘体：双环 + 12 符文刻痕 + 内盘 + 虚线环 + 四菱钉 + 宝珠 -->
                    <circle class="d-ring1" r="70" />
                    <circle class="d-ring2" r="60" />
                    <g class="d-ticks">
                        <line x1="0" y1="-70" x2="0" y2="-61" />
                        <line x1="0" y1="-70" x2="0" y2="-61" transform="rotate(30)" />
                        <line x1="0" y1="-70" x2="0" y2="-61" transform="rotate(60)" />
                        <line x1="0" y1="-70" x2="0" y2="-61" transform="rotate(90)" />
                        <line x1="0" y1="-70" x2="0" y2="-61" transform="rotate(120)" />
                        <line x1="0" y1="-70" x2="0" y2="-61" transform="rotate(150)" />
                        <line x1="0" y1="-70" x2="0" y2="-61" transform="rotate(180)" />
                        <line x1="0" y1="-70" x2="0" y2="-61" transform="rotate(210)" />
                        <line x1="0" y1="-70" x2="0" y2="-61" transform="rotate(240)" />
                        <line x1="0" y1="-70" x2="0" y2="-61" transform="rotate(270)" />
                        <line x1="0" y1="-70" x2="0" y2="-61" transform="rotate(300)" />
                        <line x1="0" y1="-70" x2="0" y2="-61" transform="rotate(330)" />
                    </g>
                    <circle class="d-inner" r="50" />
                    <circle class="d-dash" r="38" />
                    <g class="d-studs">
                        <rect x="-3.5" y="-41.5" width="7" height="7" transform="rotate(45 0 -38)" />
                        <rect x="-3.5" y="34.5" width="7" height="7" transform="rotate(45 0 38)" />
                        <rect x="-41.5" y="-3.5" width="7" height="7" transform="rotate(45 -38 0)" />
                        <rect x="34.5" y="-3.5" width="7" height="7" transform="rotate(45 38 0)" />
                    </g>
                    <circle class="d-orbglow" r="24" />
                    <circle class="d-orb" r="14" />
                    <circle class="d-core" r="5" />
                </svg>
                <span class="yl-way__label">{{ s.num }} · {{ s.name }}</span>
                </button>

                <!-- 功能长廊子节点：进入该区自动展开七幕小传送盘，离开收起 -->
                <div v-if="s.id === 'features'" class="yl-way__subs" :class="{ 'is-open': expanded }" aria-label="功能长廊分幕导航">
                    <button
                        v-for="a in acts"
                        :id="`yl-way-sub-${a.id}`"
                        :key="a.id"
                        type="button"
                        class="yl-way__sub"
                        :class="{ 'is-lit': visitedActs.includes(a.id), 'is-cur': currentAct === a.id }"
                        :aria-label="`传送到 第${a.num}幕 ${a.name}`"
                        @click="travel(a.id)"
                    >
                        <svg class="yl-way__sub-disc" viewBox="-90 -90 180 180" aria-hidden="true">
                            <circle class="d-ring1" r="70" />
                            <circle class="d-inner" r="50" />
                            <circle class="d-orbglow" r="24" />
                            <circle class="d-orb" r="14" />
                            <circle class="d-core" r="5" />
                        </svg>
                        <span class="yl-way__label">{{ a.num }} · {{ a.name }}</span>
                    </button>
                </div>
            </template>
        </div>
    </nav>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"

// Waypoint 传送点导航（桌面右侧固定）：滚过 Hero 后滑入
// 三态：未到达（去饱和暗色）/ 已点亮（金色，滚过常亮，照游戏开传送点逻辑）/ 当前（外加旋转虚线符环）
// 点击传送（平滑滚动）；hover 标签左滑出；移动端（<1200px）隐藏

const sections = [
    { id: "hero", num: "01", name: "一乐过滤" },
    { id: "signature", num: "02", name: "过滤是什么" },
    { id: "why", num: "03", name: "过滤的优势" },
    { id: "features", num: "04", name: "功能长廊" },
    { id: "bento", num: "05", name: "更多功能" },
    { id: "community", num: "06", name: "加入社区" },
    { id: "cta", num: "07", name: "THE END" },
]

// 功能长廊七幕（子节点）
const acts = [
    { id: "act-visual", num: "01", name: "可视化编辑" },
    { id: "act-save", num: "02", name: "云端保存" },
    { id: "act-price", num: "03", name: "物价排序" },
    { id: "act-planner", num: "04", name: "通货宝石规划" },
    { id: "act-equip", num: "05", name: "装备规划器" },
    { id: "act-theme", num: "06", name: "主题编辑器" },
    { id: "act-sync", num: "07", name: "云同步" },
]

const showRail = ref(false)
const visited = ref<string[]>([])
const current = ref("hero")
const fill = ref(0)
const visitedActs = ref<string[]>([])
const currentAct = ref("")

// 处于功能长廊时展开子节点列
const expanded = computed(() => current.value === "features")

// 展开动画落定后解除 overflow 裁切（否则子节点 hover 标签被裁掉）；收起前先裁回再收
let settleTimer: ReturnType<typeof setTimeout> | undefined

watch(expanded, (open) => {
    // v-for 内的模板 ref 会被 Vue 收成数组，这里直接查 DOM（唯一实例，挂载起即存在）
    const el = document.querySelector<HTMLElement>(".yl-way__subs")
    if (settleTimer)
        clearTimeout(settleTimer)
    if (open) {
        settleTimer = setTimeout(() => el?.classList.add("is-settled"), 500)
    }
    else {
        el?.classList.remove("is-settled")
    }
})

function onScroll() {
    const y = window.scrollY
    // 滚过 Hero 大半后出现
    showRail.value = y > window.innerHeight * 0.55
    // 整页滚动进度 → 进度线填充
    const max = document.documentElement.scrollHeight - window.innerHeight
    fill.value = max > 0 ? Math.min(100, Math.round((y / max) * 100)) : 0
    // 点亮：区块顶部进入视口 60% 线即解锁（跳转传送也会点亮上方全部）
    // 当前：顶部越过视口 45% 线的最后一段
    const marks: string[] = []
    let cur = sections[0].id
    for (const s of sections) {
        const el = document.getElementById(s.id)
        if (!el) continue
        const top = el.getBoundingClientRect().top
        if (top < window.innerHeight * 0.6)
            marks.push(s.id)
        if (top <= window.innerHeight * 0.45)
            cur = s.id
    }
    visited.value = marks
    current.value = cur
    // 幕级追踪（同一口径）
    const amarks: string[] = []
    let curAct = ""
    for (const a of acts) {
        const el = document.getElementById(a.id)
        if (!el) continue
        const top = el.getBoundingClientRect().top
        if (top < window.innerHeight * 0.6)
            amarks.push(a.id)
        if (top <= window.innerHeight * 0.45)
            curAct = a.id
    }
    visitedActs.value = amarks
    currentAct.value = curAct
}

function travel(id: string) {
    const el = document.getElementById(id)
    el?.scrollIntoView({ behavior: "smooth", block: "start" })
    // 传送闪光（主节点或子节点）
    const btn = document.getElementById(`yl-way-btn-${id}`) ?? document.getElementById(`yl-way-sub-${id}`)
    btn?.classList.add("is-flash")
    setTimeout(() => btn?.classList.remove("is-flash"), 350)
}

onMounted(() => {
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
})

onBeforeUnmount(() => {
    window.removeEventListener("scroll", onScroll)
    if (settleTimer)
        clearTimeout(settleTimer)
})
</script>

<style scoped lang="scss">
.yl-way {
    position: fixed;
    right: 36px;
    top: 50%;
    transform: translateY(-50%) translateX(16px);
    z-index: 40;
    opacity: 0;
    pointer-events: none;
    transition-property: opacity, transform;
    transition-duration: 0.5s;
    transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);

    &.is-show {
        opacity: 1;
        transform: translateY(-50%) translateX(0);
        pointer-events: auto;
    }
}

.yl-way__rail {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;
    padding: 10px 0;
}

/* 进度线：轨道 + 金色填充 */
.yl-way__track,
.yl-way__fill {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: auto;
}

.yl-way__track {
    top: 10px;
    bottom: 10px;
    border-left: 2px dashed #3a362e;
}

.yl-way__fill {
    top: 10px;
    border-left: 2px solid var(--yl-gold);
    box-shadow: 0 0 8px rgba(232, 162, 60, 0.4);
    transition: height 0.2s ease;
}

/* —— 节点 —— */
.yl-way__node {
    position: relative;
    z-index: 1;
    width: 42px;
    height: 42px;
    padding: 0;
    background: transparent;
    border: none;
    cursor: pointer;
    /* 未到达态变量 */
    --w-gold: #4d483e;
    --w-gold2: #3a362e;
    --w-orb: #232019;
    --w-core: #3a362e;
    --w-glow: rgba(0, 0, 0, 0);

    /* 已点亮 */
    &.is-lit {
        --w-gold: #e8a23c;
        --w-gold2: #f4bc5e;
        --w-orb: #f4bc5e;
        --w-core: #fff7e6;
        --w-glow: rgba(232, 162, 60, 0.22);
    }

    /* 当前：更强辉光（符环见 d-halo） */
    &.is-cur {
        --w-glow: rgba(232, 162, 60, 0.32);
    }
}

.yl-way__disc {
    display: block;
    width: 42px;
    height: 42px;
    transition: transform 0.25s ease;
}

.yl-way__node:hover .yl-way__disc {
    transform: scale(1.14);
}

/* 传送闪光 */
.yl-way__node.is-flash .yl-way__disc {
    animation: yl-way-flash 0.35s ease;
}

@keyframes yl-way-flash {
    0% {
        transform: scale(0.85);
        filter: brightness(1.6);
    }

    60% {
        transform: scale(1.2);
    }

    100% {
        transform: scale(1);
    }
}

/* —— 符文圆盘各部件（消费节点上的三态变量） —— */
.d-halo {
    opacity: 0;
    transition: opacity 0.4s ease;
    transform-box: fill-box;
    transform-origin: center;
    will-change: transform;

    circle {
        fill: none;
        stroke: #f4bc5e;
        stroke-width: 2.2;
        stroke-dasharray: 11 9;
        opacity: 0.85;
    }

    rect {
        fill: #f4bc5e;
    }

    .yl-way__node.is-cur & {
        opacity: 0.95;
        animation: yl-way-spin 8s linear infinite;
    }
}

@keyframes yl-way-spin {
    to {
        transform: rotate(360deg);
    }
}

.d-ring1 {
    fill: none;
    stroke: var(--w-gold);
    stroke-width: 3;
    opacity: 0.9;
}

.d-ring2 {
    fill: none;
    stroke: var(--w-gold2);
    stroke-width: 1.2;
    opacity: 0.5;
}

.d-ticks line {
    stroke: var(--w-gold2);
    stroke-width: 2.5;
    stroke-linecap: round;
}

.d-inner {
    fill: #15120c;
    stroke: var(--w-gold);
    stroke-width: 1.2;
    opacity: 0.95;
}

.d-dash {
    fill: none;
    stroke: var(--w-gold2);
    stroke-width: 1.2;
    stroke-dasharray: 3 5;
    opacity: 0.6;
}

.d-studs rect {
    fill: var(--w-gold2);
}

.d-orbglow {
    fill: var(--w-glow);
    transition: fill 0.4s ease;
}

.d-orb {
    fill: var(--w-orb);
    transition: fill 0.4s ease;
}

.d-core {
    fill: var(--w-core);
    opacity: 0.85;
    transition: fill 0.4s ease;
}

/* —— hover 标签（节点左侧滑出） —— */
.yl-way__label {
    position: absolute;
    right: calc(100% + 12px);
    top: 50%;
    transform: translateY(-50%) translateX(6px);
    font-family: var(--yl-font-mono);
    font-size: 11px;
    letter-spacing: 0.06em;
    white-space: nowrap;
    color: var(--yl-text-primary);
    background: rgba(20, 20, 27, 0.88);
    border: 1px solid var(--yl-border-plain);
    border-radius: var(--yl-radius-sm);
    padding: 3px 9px;
    opacity: 0;
    pointer-events: none;
    transition-property: opacity, transform;
    transition-duration: 0.25s;
    transition-timing-function: ease;
}

.yl-way__node:hover .yl-way__label,
.yl-way__node:focus-visible .yl-way__label,
.yl-way__sub:hover .yl-way__label,
.yl-way__sub:focus-visible .yl-way__label {
    opacity: 1;
    transform: translateY(-50%) translateX(0);
}

.yl-way__node.is-cur .yl-way__label {
    color: var(--yl-gold-bright);
    border-color: var(--yl-border-strong);
}

/* —— 功能长廊子节点列（左支小传送盘） —— */
.yl-way__subs {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 7px;
    align-self: flex-start;
    margin: 2px 0 2px -26px;
    padding: 7px 0;
    max-height: 0;
    opacity: 0;
    overflow: hidden;
    pointer-events: none;
    transition-property: max-height, opacity;
    transition-duration: 0.45s;
    transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);

    /* 支线轨道 */
    &::before {
        content: "";
        position: absolute;
        left: 11px;
        top: 12px;
        bottom: 12px;
        border-left: 1.5px dashed #3a362e;
    }

    &.is-open {
        max-height: 260px;
        opacity: 1;
        pointer-events: auto;
    }

    /* 展开落定后解除裁切：子节点 hover 标签在容器外，不能被 hidden 吃掉 */
    &.is-settled {
        overflow: visible;
    }
}

.yl-way__sub {
    position: relative;
    width: 22px;
    height: 22px;
    padding: 0;
    background: transparent;
    border: none;
    cursor: pointer;
    --w-gold: #4d483e;
    --w-gold2: #3a362e;
    --w-orb: #232019;
    --w-core: #3a362e;
    --w-glow: rgba(0, 0, 0, 0);

    &.is-lit {
        --w-gold: #e8a23c;
        --w-gold2: #f4bc5e;
        --w-orb: #f4bc5e;
        --w-core: #fff7e6;
        --w-glow: rgba(232, 162, 60, 0.22);
    }

    &.is-cur {
        --w-glow: rgba(232, 162, 60, 0.34);
    }
}

.yl-way__sub-disc {
    display: block;
    width: 22px;
    height: 22px;
    transition: transform 0.25s ease;

    /* 22px 渲染下加粗笔画保证可读 */
    .d-ring1 {
        stroke-width: 7;
    }

    .d-inner {
        stroke-width: 3;
    }
}

.yl-way__sub:hover .yl-way__sub-disc {
    transform: scale(1.18);
}

.yl-way__sub.is-flash .yl-way__sub-disc {
    animation: yl-way-flash 0.35s ease;
}

.yl-way__sub .yl-way__label {
    right: calc(100% + 8px);
    font-size: 10px;
    padding: 2px 7px;
}

/* —— 移动端隐藏（<1200px） —— */
@media (max-width: 1199px) {
    .yl-way {
        display: none;
    }
}
</style>
