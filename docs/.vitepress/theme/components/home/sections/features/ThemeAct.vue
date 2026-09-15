<template>
    <div ref="root" class="yl-act5">
        <!-- 文案横排在上：左标题块 + 右卖点 -->
        <div class="yl-act5__head">
            <div class="yl-act5__head-main">
                <p class="yl-act__kicker" data-rise>功能长廊 · ACT 05 / 06</p>
                <h3 class="yl-act__title" data-rise style="--d: 0.06s">主题编辑器，一键全过滤换色</h3>
                <p class="yl-act5__desc" data-rise style="--d: 0.12s">
                    扫描当前过滤的全部配色，按组圈选、批量换主题——预览不写入，满意再应用。
                </p>
            </div>
            <ul class="yl-act5__points">
                <li v-for="(s, i) in listCopy" :key="i" data-rise :style="{ '--d': 0.18 + i * 0.07 + 's' }">
                    <span class="yl-act__num">{{ String(i + 1).padStart(2, "0") }}</span>
                    <span>{{ s }}</span>
                </li>
            </ul>
        </div>

        <!-- 演示面板全宽：左配色组圈选 + 右满屏散落场景（学签名叙事区的掉落感） -->
        <div ref="panel" class="yl-panel yl-theme" data-rise style="--d: 0.14s">
            <div class="yl-panel__head">
                <span class="yl-panel__dots" aria-hidden="true"><i /><i /><i /></span>
                <span class="yl-panel__title">主题编辑器 · 批量改色</span>
            </div>

            <div class="yl-theme__body" data-rise style="--d: 0.22s">
                <!-- 左分区：配色组（多选圈选，默认全选 = 一键全换） -->
                <div class="yl-theme__sets">
                    <p class="yl-theme__sets-title">配色组（勾选要换的组）</p>
                    <button
                        v-for="set in colorSets"
                        :key="set.id"
                        type="button"
                        class="yl-theme__set"
                        :class="{ 'is-on': checked.has(set.id) }"
                        @click="toggleSet(set.id)"
                    >
                        <span class="yl-theme__set-check" aria-hidden="true"></span>
                        <span class="yl-theme__set-label" :style="setLabelStyle(set)">{{ set.name }}</span>
                        <span class="yl-theme__set-count">{{ set.count }} 块</span>
                    </button>
                    <p class="yl-theme__sets-tip">已圈选 {{ checkedCount }} 组 · {{ checkedBlocks }} 个过滤块</p>
                </div>

                <!-- 右分区：散落物品场景（各组物品混排掉落，圈选组随主题换色） -->
                <div class="yl-theme__wall">
                    <div
                        v-for="(p, i) in scatteredPlates"
                        :key="p.setId + p.name"
                        class="yl-theme__plate"
                        :class="{ 'is-target': checked.has(p.setId), 'is-applied': pulsing && checked.has(p.setId) }"
                        :style="[plateStyleFor(p), { left: p.left + '%', top: p.top + '%', '--rot': p.rot + 'deg', '--i': i % 10 }]"
                    >
                        <span class="yl-theme__plate-txt">{{ p.name }}</span>
                    </div>
                    <p class="yl-theme__wall-tip">{{ themeTip }}</p>
                </div>
            </div>

            <!-- 两分区下方：操作行（一键换主题 + 还原） -->
            <div class="yl-theme__actions" data-rise style="--d: 0.26s">
                <span class="yl-theme__theme-name">当前主题：<b>{{ themeLabel }}</b></span>
                <button type="button" class="yl-theme__apply" @click="applyNextTheme">应用到过滤</button>
                <button type="button" class="yl-theme__revert" :disabled="themeIdx < 0 && !pulsing" @click="revertTheme">还原配色</button>
                <span class="yl-theme__actions-note">每点一次换下一套预置主题，只换左侧圈选的配色组</span>
            </div>
        </div>

        <!-- 编辑器实际界面：四张截图（批量改色 / 配色组 / 当前预览 / 主题市场） -->
        <div class="yl-theme__shots" data-rise style="--d: 0.34s">
            <ShotThumb src="/assets/index/主题编辑器1.webp" alt="编辑器批量改色界面" caption="编辑器实际界面 · 批量改色" pos="50% 50%" />
            <ShotThumb src="/assets/index/主题编辑器2.webp" alt="编辑器配色组界面" caption="编辑器实际界面 · 配色组圈选" pos="50% 35%" />
            <ShotThumb src="/assets/index/主题编辑器3.webp" alt="编辑器当前预览界面" caption="编辑器实际界面 · 当前预览" pos="50% 35%" />
            <ShotThumb src="/assets/index/主题编辑器4.webp" alt="编辑器主题市场界面" caption="编辑器实际界面 · 主题市场" pos="50% 30%" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue"
import ShotThumb from "./ShotThumb.vue"

// 第五幕：主题编辑器（POE1/POE2 双版本通用，不挂版本徽标）
// 演示「一键换主题」：左圈选配色组（默认全选）→ 右满屏散落场景（学签名叙事区）→ 底部按钮换预置主题
// 左侧勾选不与右侧物品显隐联动（右侧始终全量展示），只决定哪些组换色

interface ColorSet {
    id: string
    name: string
    count: number
    text: string
    bg: string
    border: string
    fs: number
    items: string[]
}

const colorSets: ColorSet[] = [
    {
        id: "red-white",
        name: "红字白底",
        count: 34,
        text: "#ff0000",
        bg: "#ffffff",
        border: "#ff0000",
        fs: 15,
        items: ["神圣石", "万用腰带", "引路石 · 16阶", "贪婪战书", "梦魇拟像裂片", "先祖密藏日志"],
    },
    {
        id: "yellow-dark",
        name: "黄字暗底",
        count: 23,
        text: "#ffff00",
        bg: "rgb(75, 75, 0)",
        border: "#dcdc00",
        fs: 13,
        items: ["毁灭者之弓", "高级混沌石", "高级工匠石", "富豪石", "未切割技能宝石 · 等级20", "红玉"],
    },
    {
        id: "orange-white",
        name: "橙字白底",
        count: 21,
        text: "rgb(180, 96, 0)",
        bg: "#ffffff",
        border: "#ff0000",
        fs: 14,
        items: ["重革腰带", "金光戒指", "先祖冠冕", "锈蚀胸甲"],
    },
    {
        id: "black-orange",
        name: "黑字橙底",
        count: 19,
        text: "#000000",
        bg: "rgb(247, 156, 110)",
        border: "#000000",
        fs: 12,
        items: ["崇高石", "混沌石", "机会石"],
    },
    {
        id: "grey-dark",
        name: "灰字暗底",
        count: 18,
        text: "rgb(150, 141, 121)",
        bg: "rgb(13, 12, 10)",
        border: "transparent",
        fs: 12,
        items: ["粗制弓", "锈蚀胸甲", "蜕变石碎片", "邪恶束衣"],
    },
]

// 预置主题（每组一套目标配色；演示用，点「应用到过滤」循环切换）
interface Theme {
    name: string
    colors: Record<string, { text: string, bg: string, border: string }>
}

const THEMES: Theme[] = [
    {
        name: "鎏金纪元",
        colors: {
            "red-white": { text: "#ffb84d", bg: "#1a1208", border: "#e8a23c" },
            "yellow-dark": { text: "#ffe08a", bg: "#2b1d05", border: "#d4a017" },
            "orange-white": { text: "#ffffff", bg: "#7a3d00", border: "#ffb84d" },
            "black-orange": { text: "#1a1208", bg: "#f0c060", border: "#1a1208" },
            "grey-dark": { text: "#c9b48a", bg: "#14100a", border: "rgba(201, 180, 138, 0.35)" },
        },
    },
    {
        name: "深海静谧",
        colors: {
            "red-white": { text: "#4dc3ff", bg: "#04182b", border: "#2a7fb8" },
            "yellow-dark": { text: "#9fe0ff", bg: "#062338", border: "#4dc3ff" },
            "orange-white": { text: "#ffffff", bg: "#0a3a5c", border: "#4dc3ff" },
            "black-orange": { text: "#04182b", bg: "#7fd4ff", border: "#04182b" },
            "grey-dark": { text: "#8fb8cc", bg: "#050d14", border: "rgba(143, 184, 204, 0.3)" },
        },
    },
    {
        name: "翡翠之梦",
        colors: {
            "red-white": { text: "#6ee787", bg: "#05170c", border: "#2eaf4f" },
            "yellow-dark": { text: "#c8f7a0", bg: "#0a2410", border: "#5cbf5c" },
            "orange-white": { text: "#ffffff", bg: "#0d3a1c", border: "#43c56a" },
            "black-orange": { text: "#05170c", bg: "#8ce8a0", border: "#05170c" },
            "grey-dark": { text: "#a3c9a8", bg: "#060d08", border: "rgba(163, 201, 168, 0.3)" },
        },
    },
]

const listCopy = [
    "配色组整组圈选，一键换掉全过滤配色",
    "预置多套主题，圈选即换、实时预览",
    "主题市场：TOP 榜主题一键应用，分享码即贴即用",
    "我的主题：保存上传你的配色方案，双版本通用",
]

// 散落物品：各组物品混排，left/top/rot 手排（学签名叙事区的自然掉落，非网格）
interface Plate {
    name: string
    setId: string
    left: number
    top: number
    rot: number
}

const scatteredPlates: Plate[] = [
    { name: "神圣石", setId: "red-white", left: 6, top: 8, rot: -2 },
    { name: "毁灭者之弓", setId: "yellow-dark", left: 58, top: 5, rot: 2 },
    { name: "重革腰带", setId: "orange-white", left: 30, top: 12, rot: -1 },
    { name: "崇高石", setId: "black-orange", left: 80, top: 10, rot: 1 },
    { name: "粗制弓", setId: "grey-dark", left: 12, top: 20, rot: 2 },
    { name: "万用腰带", setId: "red-white", left: 46, top: 16, rot: -2 },
    { name: "高级混沌石", setId: "yellow-dark", left: 66, top: 21, rot: 1 },
    { name: "金光戒指", setId: "orange-white", left: 25, top: 27, rot: -1 },
    { name: "混沌石", setId: "black-orange", left: 81, top: 25, rot: 2 },
    { name: "锈蚀胸甲", setId: "grey-dark", left: 5, top: 33, rot: 1 },
    { name: "引路石 · 16阶", setId: "red-white", left: 36, top: 31, rot: -2 },
    { name: "高级工匠石", setId: "yellow-dark", left: 57, top: 33, rot: 2 },
    { name: "先祖冠冕", setId: "orange-white", left: 76, top: 36, rot: -1 },
    { name: "机会石", setId: "black-orange", left: 19, top: 41, rot: 1 },
    { name: "蜕变石碎片", setId: "grey-dark", left: 42, top: 45, rot: -2 },
    { name: "贪婪战书", setId: "red-white", left: 7, top: 51, rot: 2 },
    { name: "富豪石", setId: "yellow-dark", left: 29, top: 53, rot: -1 },
    { name: "锈蚀胸甲", setId: "orange-white", left: 63, top: 49, rot: 1 },
    { name: "邪恶束衣", setId: "grey-dark", left: 81, top: 57, rot: -2 },
    { name: "梦魇拟像裂片", setId: "red-white", left: 33, top: 65, rot: 1 },
    { name: "未切割技能宝石 · 等级20", setId: "yellow-dark", left: 3, top: 73, rot: -1 },
    { name: "红玉", setId: "yellow-dark", left: 56, top: 69, rot: 2 },
    { name: "先祖密藏日志", setId: "red-white", left: 71, top: 81, rot: -2 },
]

const root = ref<HTMLElement>()

// 圈选的配色组（默认全选）
const checked = reactive(new Set(colorSets.map(s => s.id)))
// 当前主题：-1 = 原始配色，0~N = THEMES 下标
const themeIdx = ref(-1)
// 换主题时的错峰脉冲动画标记
const pulsing = ref(false)
let pulseTimer: ReturnType<typeof setTimeout> | undefined

const checkedCount = computed(() => checked.size)
const checkedBlocks = computed(() => colorSets.filter(s => checked.has(s.id)).reduce((n, s) => n + s.count, 0))

const themeLabel = computed(() => (themeIdx.value < 0 ? "原始配色" : THEMES[themeIdx.value].name))

const themeTip = computed(() => {
    if (checked.size === 0)
        return "左侧没有圈选任何配色组——勾选后才能换主题"
    if (themeIdx.value < 0)
        return `满屏 ${scatteredPlates.length} 个名牌 · 点下方「应用到过滤」给 ${checkedBlocks.value} 个过滤块换主题`
    return `主题「${THEMES[themeIdx.value].name}」已应用到 ${checkedBlocks.value} 个过滤块（预览，未写入）`
})

const setById = new Map(colorSets.map(s => [s.id, s]))

// 名牌配色：圈选组 → 当前主题（无主题=原色）；未圈选组 → 原配色恒定
function plateStyleFor(p: Plate) {
    const set = setById.get(p.setId)
    if (!set)
        return {}
    const themed = checked.has(p.setId) && themeIdx.value >= 0 ? THEMES[themeIdx.value].colors[p.setId] : null
    const c = themed ?? set
    return { color: c.text, background: c.bg, borderColor: c.border, fontSize: set.fs + "px" }
}

function setLabelStyle(set: ColorSet) {
    return { color: set.text, background: set.bg, borderColor: set.border }
}

function toggleSet(id: string) {
    if (checked.has(id))
        checked.delete(id)
    else
        checked.add(id)
}

// 换主题：循环下一套 + 圈选名牌错峰脉冲（换色 transition 由 CSS 过渡承接）
function pulse() {
    pulsing.value = false
    requestAnimationFrame(() => requestAnimationFrame(() => {
        pulsing.value = true
    }))
    if (pulseTimer)
        clearTimeout(pulseTimer)
    pulseTimer = setTimeout(() => {
        pulsing.value = false
    }, 1400)
}

function applyNextTheme() {
    themeIdx.value = (themeIdx.value + 1) % THEMES.length
    pulse()
}

function revertTheme() {
    themeIdx.value = -1
    pulse()
}

let io: IntersectionObserver | undefined
let riseFallback: ReturnType<typeof setTimeout> | undefined

function riseIn() {
    root.value?.classList.add("is-in")
}

onMounted(() => {
    if (!root.value) return
    root.value.classList.add("js-anim")
    io = new IntersectionObserver(
        (entries) => {
            if (entries.some(e => e.isIntersecting)) {
                requestAnimationFrame(() => requestAnimationFrame(riseIn))
                io?.disconnect()
            }
        },
        { threshold: 0.25 },
    )
    io.observe(root.value)
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
    if (pulseTimer) clearTimeout(pulseTimer)
})
</script>

<style scoped lang="scss">
.yl-act5 {
    width: min(var(--yl-container), 100%);
    margin-inline: auto;
    box-sizing: border-box;
    padding-inline: var(--yl-space-content);
    margin-top: clamp(64px, 9vh, 120px);
    padding-top: clamp(48px, 7vh, 88px);
    border-top: 1px dashed var(--yl-border);
}

/* —— 入场：淡入 + 上浮 —— */
.yl-act5.js-anim [data-rise] {
    opacity: 0;
    transform: translateY(24px);
}

.yl-act5.js-anim.is-in [data-rise] {
    opacity: 1;
    transform: none;
    /* 注意：构建管线会吃掉 transition 简写里的 var()，必须拆 longhand */
    transition-property: opacity, transform;
    transition-duration: 0.65s;
    transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
    transition-delay: var(--d, 0s);
}

/* —— 文案横排在上 —— */
.yl-act5__head {
    display: grid;
    grid-template-columns: minmax(0, 5fr) minmax(0, 4fr);
    gap: clamp(28px, 4vw, 56px);
    align-items: end;
    margin-bottom: clamp(28px, 4vh, 44px);
}

.yl-act5__head-main {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.yl-act__kicker {
    font-family: var(--yl-font-mono);
    font-size: 13px;
    letter-spacing: 0.22em;
    color: var(--yl-gold);
}

.yl-act__title {
    font-family: var(--yl-font-display);
    font-weight: 900;
    font-size: clamp(26px, 3.4vw, 38px);
    color: var(--yl-text-primary);
}

.yl-act5__desc {
    max-width: 520px;
    line-height: 1.8;
    color: var(--yl-text-secondary);
}

.yl-act5__points {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px 22px;

    li {
        display: flex;
        gap: 12px;
        align-items: baseline;
        font-size: 14px;
        line-height: 1.7;
        color: var(--yl-text-primary);
    }
}

.yl-act__num {
    font-family: var(--yl-font-mono);
    font-size: 13px;
    color: var(--yl-gold);
}

/* —— 面板外壳 —— */
.yl-panel {
    background: var(--yl-bg-elevated);
    border: 1px solid var(--yl-border-plain);
    border-radius: var(--yl-radius-lg);
    padding: 16px 20px 18px;
    box-shadow: 0 0 32px rgba(0, 0, 0, 0.35);
    text-align: left;
}

.yl-panel__head {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-bottom: 13px;
    border-bottom: 1px solid var(--yl-border-plain);
    margin-bottom: 12px;
}

.yl-panel__dots {
    display: flex;
    gap: 5px;

    i {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--yl-border-strong);
    }
}

.yl-panel__title {
    flex: 1;
    font-family: var(--yl-font-mono);
    font-size: 12px;
    letter-spacing: 0.08em;
    color: var(--yl-text-secondary);
    white-space: nowrap;
}

/* —— 两分区：左配色组 / 右散落场景 —— */
.yl-theme__body {
    display: grid;
    grid-template-columns: minmax(0, 3fr) minmax(0, 10fr);
    gap: 16px;
    align-items: stretch;
}

/* 左：配色组 */
.yl-theme__sets {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.yl-theme__sets-title {
    font-size: 12px;
    font-weight: 700;
    color: var(--yl-text-secondary);
    margin-bottom: 2px;
}

.yl-theme__set {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 7px 10px;
    border: 1px solid var(--yl-border-plain);
    border-radius: var(--yl-radius-sm);
    background: rgba(0, 0, 0, 0.18);
    cursor: pointer;
    text-align: left;
    transition: border-color 0.2s ease, background-color 0.2s ease;

    &:hover {
        border-color: var(--yl-border-strong);
    }

    &.is-on {
        border-color: var(--yl-gold);
        background: rgba(232, 162, 60, 0.06);
    }
}

.yl-theme__set-check {
    width: 13px;
    height: 13px;
    border: 1.5px solid var(--yl-border-strong);
    border-radius: 3px;
    flex-shrink: 0;
    transition: background-color 0.15s ease, border-color 0.15s ease;

    .yl-theme__set.is-on & {
        background: var(--yl-gold-bright);
        border-color: var(--yl-gold-bright);
    }
}

.yl-theme__set-label {
    flex: 1;
    min-width: 0;
    font-size: 12px;
    font-weight: 700;
    border: 1px solid;
    border-radius: 4px;
    padding: 2px 7px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.yl-theme__set-count {
    flex-shrink: 0;
    font-family: var(--yl-font-mono);
    font-size: 11px;
    color: var(--yl-text-faint);
}

.yl-theme__sets-tip {
    margin-top: 4px;
    font-size: 11px;
    color: var(--yl-gold);
    font-family: var(--yl-font-mono);
}

/* 右：散落场景（学签名叙事区满屏掉落） */
.yl-theme__wall {
    position: relative;
    min-height: 540px;
    border-radius: var(--yl-radius);
    overflow: hidden;
    background:
        radial-gradient(ellipse at 50% 115%, rgba(232, 162, 60, 0.07), transparent 55%),
    repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.18) 0 26px, rgba(255, 255, 255, 0.012) 26px 52px),
    rgba(0, 0, 0, 0.22);
}

.yl-theme__plate {
    position: absolute;
    display: inline-flex;
    align-items: center;
    padding: 5px 12px;
    border: 2px solid;
    border-radius: 3px;
    font-weight: 700;
    line-height: 1.4;
    transform: rotate(var(--rot, 0deg));
    transition: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.yl-theme__plate-txt {
    min-width: 0;
    white-space: nowrap;
}

/* 圈选目标：金色微光描边（已换主题的组保持微光示「已应用」） */
.yl-theme__plate.is-target {
    box-shadow: 0 0 0 1px rgba(232, 162, 60, 0.45), 0 0 12px rgba(232, 162, 60, 0.15);
}

/* 名牌进场：错峰下落浮现 */
.yl-act5.js-anim.is-in .yl-theme__plate {
    animation: yl-act5-plate-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
    animation-delay: calc(0.55s + var(--i, 0) * 0.045s);
}

@keyframes yl-act5-plate-in {
    from {
        opacity: 0;
        transform: rotate(var(--rot, 0deg)) translateY(-16px);
    }

    to {
        opacity: 1;
        transform: rotate(var(--rot, 0deg));
    }
}

/* 换主题脉冲：圈选名牌错峰 pop + 辉光 */
.yl-theme__plate.is-applied {
    animation: yl-act5-plate-pop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    animation-delay: calc(var(--i, 0) * 0.08s);
}

@keyframes yl-act5-plate-pop {
    0% {
        transform: rotate(var(--rot, 0deg)) scale(1);
    }

    45% {
        transform: rotate(var(--rot, 0deg)) scale(1.14);
        box-shadow: 0 0 22px rgba(232, 162, 60, 0.55);
    }

    100% {
        transform: rotate(var(--rot, 0deg)) scale(1);
    }
}

.yl-theme__wall-tip {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 8px;
    font-size: 11px;
    color: var(--yl-text-faint);
    text-align: center;
}

/* —— 两分区下方：操作行 —— */
.yl-theme__actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: 14px;
}

.yl-theme__theme-name {
    font-size: 13px;
    color: var(--yl-text-secondary);

    b {
        color: var(--yl-gold-bright);
    }
}

.yl-theme__apply {
    padding: 9px 20px;
    font-size: 14px;
    font-weight: 700;
    color: #1b1305;
    background: linear-gradient(135deg, var(--yl-gold-bright), var(--yl-gold-deep));
    border: none;
    border-radius: var(--yl-radius);
    cursor: pointer;
    box-shadow: 0 2px 14px rgba(232, 162, 60, 0.35);
    transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;

    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 18px rgba(232, 162, 60, 0.45);
    }

    &:active {
        transform: translateY(0);
        filter: brightness(0.95);
    }
}

.yl-theme__revert {
    padding: 8px 18px;
    font-size: 13px;
    color: var(--yl-text-secondary);
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid var(--yl-border-plain);
    border-radius: var(--yl-radius);
    cursor: pointer;
    transition: border-color 0.2s ease, color 0.2s ease, opacity 0.2s ease;

    &:hover {
        color: var(--yl-text-primary);
        border-color: var(--yl-border-strong);
    }

    &:disabled {
        opacity: 0.45;
        cursor: not-allowed;
    }
}

.yl-theme__actions-note {
    margin-left: auto;
    font-size: 11px;
    color: var(--yl-text-faint);
}

/* —— 底部截图（一行四张） —— */
.yl-theme__shots {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;

    :deep(.yl-shot) {
        margin-top: 16px;
    }
}

/* —— 移动端 —— */
@media (max-width: 959px) {
    .yl-act5__head {
        grid-template-columns: 1fr;
        gap: 22px;
        align-items: start;
    }

    .yl-act5__points {
        grid-template-columns: 1fr;
        gap: 10px;
    }

    .yl-panel {
        padding: 14px 14px 16px;
    }

    .yl-theme__body {
        grid-template-columns: 1fr;
    }

    .yl-theme__wall {
        min-height: 480px;
    }

    /* 窄屏散落收紧：名牌缩小 + 长名截断（手排百分比自适应列宽） */
    .yl-theme__plate {
        font-size: 11px !important;
        padding: 3px 7px;
        border-width: 1.5px;
        max-width: 26vw;
    }

    .yl-theme__plate-txt {
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .yl-theme__actions-note {
        margin-left: 0;
        width: 100%;
    }
}
</style>
