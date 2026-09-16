<template>
    <div ref="root" class="yl-actcs">
        <div class="yl-act__grid yl-actcs__grid">
            <!-- 左列：演示（mini 复刻：自定义过滤列表 + 五类差异更新弹窗） -->
            <div class="yl-act__demo">
                <div ref="panel" class="yl-panel yl-csave" data-rise style="--d: 0.1s">
                    <div class="yl-panel__head">
                        <span class="yl-panel__dots" aria-hidden="true"><i /><i /><i /></span>
                        <span class="yl-panel__title">过滤列表 · 自定义过滤</span>
                        <span class="yl-csave__latest">最新 v{{ latestVersion }}</span>
                    </div>

                    <!-- 成功提示条（更新完成后展示，文案取自编辑器真实提示） -->
                    <div v-if="done" class="yl-csave__ok">
                        <span>过滤器更新成功，已为您上传保存到云端</span>
                    </div>
                    <!-- 保存提示条（点「保存到云端」后短暂展示） -->
                    <div v-else-if="savedFlash" class="yl-csave__ok is-save">
                        <span>已保存到云端 · 编辑进度已记录</span>
                    </div>

                    <!-- 更新提示条（选中落后版本的自定义过滤时展示，文案取自编辑器真实弹窗） -->
                    <div v-if="needUpdateHint && !done && !showDiff" class="yl-csave__hint">
                        <span>该自定义版本有更新，请点击更新过滤按钮进行更新</span>
                        <button type="button" class="yl-csave__update-btn" @click="showDiff = true">更新过滤</button>
                    </div>

                    <div class="yl-csave__body">
                        <!-- 预设过滤组（收起态示意，同编辑器左侧列表形态） -->
                        <div class="yl-csave__group">
                            <div class="yl-csave__group-head is-fold">
                                <span class="yl-csave__fold" aria-hidden="true">▸</span>
                                <span>预设过滤 v{{ latestVersion }}</span>
                            </div>
                        </div>

                        <!-- 自定义过滤组 -->
                        <div class="yl-csave__group">
                            <div class="yl-csave__group-head">
                                <span class="yl-csave__fold is-open" aria-hidden="true">▾</span>
                                <span>自定义过滤</span>
                            </div>
                            <div class="yl-csave__items">
                                <button
                                    v-for="e in entries"
                                    :key="e.id"
                                    type="button"
                                    class="yl-csave__item"
                                    :class="{ 'is-on': selected === e.id, 'is-updated': e.id === updatedId }"
                                    @click="select(e.id)"
                                >
                                    <span class="yl-csave__name">{{ e.name }}</span>
                                    <span v-if="e.outdated" class="yl-csave__new">有更新</span>
                                    <span class="yl-csave__ver" :class="{ 'is-old': e.outdated }">v{{ e.version }}</span>
                                    <span class="yl-csave__date">{{ e.date }}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="yl-csave__foot">
                        <button type="button" class="yl-csave__save" :disabled="saving" @click="save">
                            {{ saving ? "保存中…" : "保存到云端" }}
                        </button>
                        <button type="button" class="yl-csave__reset" @click="reset">重置演示</button>
                        <span class="yl-csave__note">示例数据</span>
                    </div>

                    <!-- 五类差异更新弹窗（mini 复刻「过滤新版本更新」弹窗，面板内浮层） -->
                    <Transition name="yl-csave-pop">
                        <div v-if="showDiff" class="yl-csave__overlay">
                            <div class="yl-csave__modal">
                                <div class="yl-csave__modal-head">
                                    <span class="yl-csave__modal-title">过滤新版本更新</span>
                                    <span class="yl-csave__modal-sub">开荒特调 · v3.28.1 → v{{ latestVersion }}</span>
                                    <button v-if="!updating" type="button" class="yl-csave__close" aria-label="关闭" @click="showDiff = false">×</button>
                                </div>

                                <div class="yl-csave__cols">
                                    <div
                                        v-for="(col, ci) in diffCols"
                                        :key="col.label"
                                        class="yl-csave__col"
                                        :class="[`is-${col.key}`, { 'is-merged': merged }]"
                                        :style="{ '--ci': ci }"
                                    >
                                        <div class="yl-csave__col-head">
                                            <span class="yl-csave__col-icon" aria-hidden="true" v-html="col.icon" />
                                            <span class="yl-csave__col-label">{{ col.label }}</span>
                                            <span class="yl-csave__col-count">共 {{ col.count }} {{ col.unit }}</span>
                                        </div>
                                        <div class="yl-csave__col-body">
                                            <!-- 新增：块名 + 只读配色预览 -->
                                            <template v-if="col.key === 'add'">
                                                <div v-for="r in col.rows" :key="r.name" class="yl-csave__row is-add">
                                                    <span class="yl-csave__row-name">{{ r.name }}</span>
                                                    <span class="yl-csave__chip" :style="{ color: r.fg, background: r.bg, borderColor: r.border || 'transparent' }">样例</span>
                                                </div>
                                            </template>
                                            <!-- 删除：块名（降透明度） -->
                                            <template v-else-if="col.key === 'del'">
                                                <div v-for="r in col.rows" :key="r.name" class="yl-csave__row is-del">
                                                    <span class="yl-csave__row-name">{{ r.name }}</span>
                                                </div>
                                            </template>
                                            <!-- 追加：目标块 + 值列表 -->
                                            <template v-else-if="col.key === 'append'">
                                                <div v-for="r in col.rows" :key="r.target" class="yl-csave__row is-append">
                                                    <span class="yl-csave__row-target">{{ r.target }}</span>
                                                    <span v-for="v in r.values" :key="v" class="yl-csave__val is-plus">+ {{ v }}</span>
                                                </div>
                                            </template>
                                            <!-- 改名：旧值 → 新值 -->
                                            <template v-else-if="col.key === 'rename'">
                                                <div v-for="r in col.rows" :key="r.old" class="yl-csave__row is-rename">
                                                    <span class="yl-csave__val is-old-val">{{ r.old }}</span>
                                                    <span class="yl-csave__val is-new-val">{{ r.new }}</span>
                                                </div>
                                            </template>
                                            <!-- 移除：块名 + 划线值 -->
                                            <template v-else>
                                                <div v-for="r in col.rows" :key="r.block" class="yl-csave__row is-remove">
                                                    <span class="yl-csave__row-target">{{ r.block }}</span>
                                                    <span v-for="v in r.values" :key="v" class="yl-csave__val is-minus">× {{ v }}</span>
                                                </div>
                                            </template>
                                        </div>
                                    </div>
                                </div>

                                <div class="yl-csave__modal-foot">
                                    <button type="button" class="yl-csave__cancel" :disabled="updating" @click="showDiff = false">取消</button>
                                    <button type="button" class="yl-csave__confirm" :disabled="updating" @click="confirmUpdate">
                                        <span v-if="updating" class="yl-csave__spin" aria-hidden="true" />
                                        {{ updating ? "更新中" : "确认更新" }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Transition>
                </div>

                <!-- 编辑器实际界面：窗框缩略图，点击放大（截图待用户提供，缺图自动整块隐藏） -->
                <div class="yl-csave__shots" data-rise style="--d: 0.3s">
                    <ShotThumb src="/assets/index/云端保存与更新1.webp" alt="编辑器保存到云端界面" caption="编辑器实际界面 · 保存到云端" pos="50% 30%" />
                    <ShotThumb src="/assets/index/云端保存与更新2.webp" alt="编辑器过滤新版本更新弹窗" caption="编辑器实际界面 · 过滤新版本更新（五类差异）" pos="50% 40%" />
                </div>
            </div>

            <!-- 右列：文案 -->
            <div class="yl-act__copy">
                <p class="yl-act__kicker" data-rise>功能长廊 · ACT 02 / 07</p>
                <h3 class="yl-act__title" data-rise style="--d: 0.06s">云端保存，一键自动更新<span class="yl-act__badge">POE1</span></h3>
                <p class="yl-actcs__desc" data-rise style="--d: 0.12s">
                    编辑内容保存到云端，多台设备随时继续编辑；发布新版本后，五类更新差异一键合并进你的自定义内容——自定义配置跨赛季继承。
                </p>
                <ul class="yl-act__list">
                    <li v-for="(s, i) in listCopy" :key="i" data-rise :style="{ '--d': 0.18 + i * 0.08 + 's' }">
                        <span class="yl-act__num">{{ String(i + 1).padStart(2, "0") }}</span>
                        <span>{{ s }}</span>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue"
import ShotThumb from "./ShotThumb.vue"

// 云端保存 + 一键自动更新（POE1）：mini 复刻「过滤列表 + 过滤新版本更新」五类差异弹窗
// 流程：选中落后版本的自定义过滤 → 提示条 + 虚线「更新过滤」→ 五类差异预览 → 确认更新（列错峰收拢合并）
// → 列表条目版本翻新 + 成功条「过滤器更新成功，已为您上传保存到云端」（文案均取自编辑器真实提示）
// 块名取自一乐过滤 POE1 真实过滤文件（poe1-filters），物品名取自 json-data/poe1；差异组装为示例数据

const latestVersion = "3.29.2"

interface Entry {
    id: string
    name: string
    version: string
    date: string
    outdated: boolean
}

const INIT_ENTRIES: Entry[] = [
    { id: "e1", name: "开荒特调", version: "3.28.1", date: "08-20", outdated: true },
    { id: "e2", name: "打宝专用", version: "3.29.2", date: "09-02", outdated: false },
    { id: "e3", name: "每日速刷", version: "3.29.2", date: "09-10", outdated: false },
]

// 五类差异样本（同编辑器 update-btn 的五列：新增/删除/追加/改名/移除）
interface DiffCol {
    key: "add" | "del" | "append" | "rename" | "remove"
    label: string
    unit: string
    icon: string
    rows: { name?: string, fg?: string, bg?: string, border?: string, target?: string, block?: string, values?: string[], old?: string, new?: string }[]
    count: number
}

const diffCols: DiffCol[] = [
    {
        key: "add",
        label: "新增过滤块",
        unit: "项",
        icon: '<svg viewBox="0 0 16 16" width="11" height="11"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
        rows: [
            { name: "传奇装备 · 赛季传奇 · 忆境传奇", fg: "#af6025", bg: "rgba(0, 0, 0, 0.3)" },
            { name: "全局设置 · 活动通货", fg: "#e8a23c", bg: "#1b1b24" },
        ],
        count: 2,
    },
    {
        key: "del",
        label: "删除过滤块",
        unit: "项",
        icon: '<svg viewBox="0 0 16 16" width="11" height="11"><path d="M3 4h10M6 4V2.5h4V4M5 4l.7 9h4.6L11 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>',
        rows: [
            { name: "命运卡 · 优先屏蔽的命运卡" },
            { name: "地图 · 常规地图 · T1-T5腐化黄" },
        ],
        count: 2,
    },
    {
        key: "append",
        label: "过滤块追加",
        unit: "值",
        icon: '<svg viewBox="0 0 16 16" width="11" height="11"><path d="M3 4h10M3 8h7M3 12h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M12.5 9.5v4M10.5 11.5h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
        rows: [
            { target: "命运卡 · T1命运卡", values: ["觉醒", "天启"] },
            { target: "传奇装备 · 超高价值", values: ["法师之血"] },
        ],
        count: 3,
    },
    {
        key: "rename",
        label: "物品改名",
        unit: "对",
        icon: '<svg viewBox="0 0 16 16" width="11" height="11"><path d="M9.5 3.5l3 3L6 13H3v-3l6.5-6.5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/></svg>',
        rows: [
            { old: "贝雷克的火与雷之乐", new: "贝雷克的火与雷之曲" },
        ],
        count: 1,
    },
    {
        key: "remove",
        label: "移除",
        unit: "值",
        icon: '<svg viewBox="0 0 16 16" width="11" height="11"><path d="M3 8h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
        rows: [
            { block: "传奇装备 · 高价值", values: ["侍从", "群星之灰"] },
        ],
        count: 2,
    },
]

const listCopy = [
    "自定义过滤云端保存，编辑进度全程记录",
    "多台设备随时打开继续，无需重复下载",
    "新版本一键更新，自定义内容不丢失",
    "五类差异逐项预览，更新了什么一目了然",
]

const root = ref<HTMLElement>()

const entries = ref<Entry[]>(INIT_ENTRIES.map(e => ({ ...e })))
const selected = ref<string | null>(null)
const showDiff = ref(false)
const updating = ref(false)
const merged = ref(false)
const done = ref(false)
const updatedId = ref<string | null>(null)
const saving = ref(false)
const savedFlash = ref(false)

let updateTimers: ReturnType<typeof setTimeout>[] = []
let saveTimers: ReturnType<typeof setTimeout>[] = []

// 选中条目落后于最新版本且未完成更新时，展示提示条
const needUpdateHint = computed(() => {
    const e = entries.value.find(x => x.id === selected.value)
    return !!e?.outdated
})

function select(id: string) {
    if (updating.value)
        return
    selected.value = id
}

function confirmUpdate() {
    if (updating.value)
        return
    updating.value = true
    merged.value = false
    // 900ms 模拟应用差异 → 五列错峰收拢 → 关弹窗、条目版本翻新、成功条
    updateTimers.push(setTimeout(() => {
        merged.value = true
    }, 900))
    updateTimers.push(setTimeout(() => {
        showDiff.value = false
        updating.value = false
        done.value = true
        savedFlash.value = false
        const e = entries.value.find(x => x.id === selected.value)
        if (e) {
            e.version = latestVersion
            e.outdated = false
            updatedId.value = e.id
        }
    }, 1650))
}

function save() {
    if (saving.value)
        return
    saving.value = true
    saveTimers.push(setTimeout(() => {
        saving.value = false
        if (!done.value)
            savedFlash.value = true
        saveTimers.push(setTimeout(() => {
            savedFlash.value = false
        }, 2200))
    }, 650))
}

function reset() {
    updateTimers.forEach(clearTimeout)
    saveTimers.forEach(clearTimeout)
    updateTimers = []
    saveTimers = []
    entries.value = INIT_ENTRIES.map(e => ({ ...e }))
    selected.value = null
    showDiff.value = false
    updating.value = false
    merged.value = false
    done.value = false
    updatedId.value = null
    saving.value = false
    savedFlash.value = false
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
                // 双 rAF：先让隐藏初始态绘制一帧再触发过渡，修复"载入时已在视口内→无动画直接显示"
                requestAnimationFrame(() => requestAnimationFrame(riseIn))
                io?.disconnect()
            }
        },
        { threshold: 0.25 },
    )
    io.observe(root.value)
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
    updateTimers.forEach(clearTimeout)
    saveTimers.forEach(clearTimeout)
})
</script>

<style scoped lang="scss">
.yl-actcs {
    width: min(var(--yl-container), 100%);
    margin-inline: auto;
    box-sizing: border-box;
    padding-inline: var(--yl-space-content);
    margin-top: clamp(64px, 9vh, 120px);
    padding-top: clamp(48px, 7vh, 88px);
    border-top: 1px dashed var(--yl-border);
}

.yl-act__grid {
    display: grid;
    gap: clamp(36px, 5vw, 72px);
    align-items: center;
}

/* 第二幕镜像：演示在左、文案在右 */
.yl-actcs__grid {
    grid-template-columns: minmax(0, 6fr) minmax(0, 5fr);
}

/* —— 入场：淡入 + 上浮 —— */
.yl-actcs.js-anim [data-rise] {
    opacity: 0;
    transform: translateY(24px);
}

.yl-actcs.js-anim.is-in [data-rise] {
    opacity: 1;
    transform: none;
    /* 注意：构建管线会吃掉 transition 简写里的 var()，必须拆成 longhand */
    transition-property: opacity, transform;
    transition-duration: 0.65s;
    transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
    transition-delay: var(--d, 0s);
}

/* —— 右列文案 —— */
.yl-act__copy {
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
    position: relative;
    width: fit-content; /* 收缩到文字宽度，徽标挂在文字右外侧，不占标题行宽 */
    font-family: var(--yl-font-display);
    font-weight: 900;
    font-size: clamp(26px, 3.4vw, 38px);
    color: var(--yl-text-primary);
}

/* POE1 编辑器专属功能徽标：标题末字右上方（列间隙内）；移动端回退为行内 */
.yl-act__badge {
    position: absolute;
    top: -4px;
    right: -58px;
    font-family: var(--yl-font-mono);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    line-height: 1.6;
    color: var(--yl-gold-bright);
    border: 1px solid var(--yl-border-strong);
    background: rgba(232, 162, 60, 0.08);
    border-radius: var(--yl-radius-sm);
    padding: 2px 7px;
    white-space: nowrap;
}

.yl-actcs__desc {
    max-width: 440px;
    line-height: 1.8;
    color: var(--yl-text-secondary);
}

.yl-act__list {
    display: flex;
    flex-direction: column;
    gap: 13px;
    margin-top: 12px;

    li {
        display: flex;
        gap: 13px;
        align-items: baseline;
        font-size: 15px;
        line-height: 1.7;
        color: var(--yl-text-primary);
    }

    .yl-act__num {
        color: var(--yl-gold);
    }
}

.yl-act__num {
    font-family: var(--yl-font-mono);
    font-size: 13px;
}

/* —— 面板外壳 —— */
.yl-panel {
    position: relative; /* 弹窗浮层的定位锚点 */
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
    min-width: 0;
    font-family: var(--yl-font-mono);
    font-size: 12px;
    letter-spacing: 0.08em;
    color: var(--yl-text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.yl-csave__latest {
    flex-shrink: 0;
    font-family: var(--yl-font-mono);
    font-size: 11px;
    color: var(--yl-gold-bright);
    border: 1px solid var(--yl-border-strong);
    border-radius: var(--yl-radius-sm);
    padding: 2px 7px;
}

/* —— 成功/保存提示条 —— */
.yl-csave__ok {
    margin-bottom: 12px;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 700;
    color: #67c23a;
    border: 1px solid rgba(103, 194, 58, 0.4);
    border-radius: var(--yl-radius);
    background: rgba(103, 194, 58, 0.07);
    animation: yl-csave-bar-in 0.4s ease both;

    &.is-save {
        color: var(--yl-gold-bright);
        border-color: var(--yl-border-strong);
        background: rgba(232, 162, 60, 0.07);
    }
}

/* —— 更新提示条（含虚线「更新过滤」按钮） —— */
.yl-csave__hint {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    padding: 8px 12px;
    font-size: 12px;
    color: var(--yl-gold-bright);
    border: 1px dashed var(--yl-border-strong);
    border-radius: var(--yl-radius);
    background: rgba(232, 162, 60, 0.05);
    animation: yl-csave-bar-in 0.4s ease both;

    span {
        flex: 1;
        min-width: 0;
        line-height: 1.6;
    }
}

@keyframes yl-csave-bar-in {
    from {
        opacity: 0;
        transform: translateY(-6px);
    }

    to {
        opacity: 1;
        transform: none;
    }
}

.yl-csave__update-btn {
    flex-shrink: 0;
    padding: 6px 14px;
    font-size: 12px;
    font-weight: 700;
    color: var(--yl-gold-bright);
    background: transparent;
    border: 1px dashed var(--yl-border-strong);
    border-radius: var(--yl-radius);
    cursor: pointer;
    transition: background-color 0.2s ease, border-color 0.2s ease;

    &:hover {
        background: rgba(232, 162, 60, 0.1);
    }
}

/* —— 主体：过滤列表 —— */
.yl-csave__body {
    display: flex;
    flex-direction: column;
    gap: 4px;
    border-radius: var(--yl-radius);
    background: rgba(0, 0, 0, 0.18);
    padding: 10px 12px;
    min-height: 264px;
}

.yl-csave__group-head {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 5px 4px;
    font-size: 12px;
    font-weight: 700;
    color: var(--yl-text-secondary);

    &.is-fold {
        color: var(--yl-text-faint);
    }
}

.yl-csave__fold {
    font-size: 10px;
    color: var(--yl-text-faint);

    &.is-open {
        color: var(--yl-gold);
    }
}

.yl-csave__items {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.yl-csave__item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    text-align: left;
    border: 1px solid var(--yl-border-plain);
    border-radius: var(--yl-radius-sm);
    background: rgba(0, 0, 0, 0.2);
    cursor: pointer;
    transition: border-color 0.2s ease, background-color 0.2s ease;

    &:hover {
        border-color: var(--yl-border-strong);
    }

    &.is-on {
        border-color: var(--yl-border-strong);
        background: rgba(232, 162, 60, 0.07);
    }

    &.is-updated {
        border-color: rgba(103, 194, 58, 0.55);
        animation: yl-csave-item-flash 1.2s ease both;
    }
}

@keyframes yl-csave-item-flash {
    0% {
        background: rgba(103, 194, 58, 0.16);
        box-shadow: 0 0 0 1px rgba(103, 194, 58, 0.4);
    }

    100% {
        background: rgba(0, 0, 0, 0.2);
        box-shadow: none;
    }
}

.yl-csave__name {
    flex: 1;
    min-width: 0;
    font-size: 13px;
    font-weight: 700;
    color: var(--yl-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.yl-csave__new {
    flex-shrink: 0;
    font-size: 10px;
    font-weight: 700;
    color: var(--yl-gold-bright);
    border: 1px solid var(--yl-border-strong);
    border-radius: var(--yl-radius-sm);
    padding: 1px 6px;
    animation: yl-csave-new-pulse 1.8s ease-in-out infinite;
}

@keyframes yl-csave-new-pulse {
    0%, 100% {
        box-shadow: 0 0 0 0 rgba(232, 162, 60, 0);
    }

    50% {
        box-shadow: 0 0 10px 1px rgba(232, 162, 60, 0.45);
    }
}

.yl-csave__ver {
    flex-shrink: 0;
    font-family: var(--yl-font-mono);
    font-size: 11px;
    color: var(--yl-text-secondary);

    &.is-old {
        color: #f56c6c;
    }
}

.yl-csave__date {
    flex-shrink: 0;
    font-family: var(--yl-font-mono);
    font-size: 10px;
    color: var(--yl-text-faint);
}

/* —— 底部：保存 / 重置 —— */
.yl-csave__foot {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 14px;
}

.yl-csave__save {
    padding: 8px 18px;
    font-size: 13px;
    font-weight: 700;
    color: var(--yl-gold-bright);
    background: rgba(232, 162, 60, 0.08);
    border: 1px solid var(--yl-border-strong);
    border-radius: var(--yl-radius);
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.2s ease;

    &:hover:not(:disabled) {
        background: rgba(232, 162, 60, 0.16);
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.7;
        cursor: wait;
    }
}

.yl-csave__reset {
    padding: 8px 16px;
    font-size: 12px;
    color: var(--yl-text-secondary);
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid var(--yl-border-plain);
    border-radius: var(--yl-radius);
    cursor: pointer;
    transition: border-color 0.2s ease, color 0.2s ease;

    &:hover {
        color: var(--yl-text-primary);
        border-color: var(--yl-border-strong);
    }
}

.yl-csave__note {
    margin-left: auto;
    font-size: 11px;
    color: var(--yl-text-faint);
}

/* —— 五类差异弹窗（面板内浮层） —— */
.yl-csave__overlay {
    position: absolute;
    inset: 0;
    z-index: 5;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 14px;
    border-radius: inherit;
    background: rgba(11, 11, 15, 0.6);
    backdrop-filter: blur(2px);
    overflow-y: auto;
}

.yl-csave-pop-enter-active {
    animation: yl-csave-pop-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.yl-csave-pop-leave-active {
    animation: yl-csave-pop-in 0.18s ease reverse both;
}

@keyframes yl-csave-pop-in {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.yl-csave__modal {
    width: 100%;
    max-width: 640px;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--yl-border-strong);
    border-radius: var(--yl-radius);
    background: var(--yl-bg-overlay);
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.6);
    animation: yl-csave-modal-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes yl-csave-modal-in {
    from {
        opacity: 0;
        transform: translateY(14px) scale(0.97);
    }

    to {
        opacity: 1;
        transform: none;
    }
}

.yl-csave__modal-head {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 11px 14px;
    border-bottom: 1px solid var(--yl-border-plain);
}

.yl-csave__modal-title {
    font-size: 13px;
    font-weight: 700;
    color: var(--yl-text-primary);
    white-space: nowrap;
}

.yl-csave__modal-sub {
    flex: 1;
    min-width: 0;
    font-family: var(--yl-font-mono);
    font-size: 11px;
    color: var(--yl-text-faint);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.yl-csave__close {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    font-size: 16px;
    line-height: 1;
    color: var(--yl-text-secondary);
    background: transparent;
    border: none;
    border-radius: var(--yl-radius-sm);
    cursor: pointer;
    transition: color 0.2s ease, background-color 0.2s ease;

    &:hover {
        color: var(--yl-text-primary);
        background: rgba(0, 0, 0, 0.3);
    }
}

/* 五列：各列独立配色（新增绿/删除红/追加金/改名蓝/移除橙，对齐编辑器 n-tag 色系） */
.yl-csave__cols {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 8px;
    padding: 12px 14px;
}

.yl-csave__col {
    display: flex;
    flex-direction: column;
    min-width: 0;
    border: 1px solid var(--yl-border-plain);
    border-radius: var(--yl-radius-sm);
    background: rgba(0, 0, 0, 0.22);
    overflow: hidden;

    /* 确认更新：列错峰收拢下沉（合并演出），随后整弹窗退场 */
    &.is-merged {
        opacity: 0;
        transform: translateY(8px) scale(0.96);
        transition-property: opacity, transform;
        transition-duration: 0.45s;
        transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
        transition-delay: calc(var(--ci, 0) * 0.09s);
    }
}

.yl-csave__col-head {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 7px;
    border-bottom: 1px solid var(--yl-border-plain);
}

.yl-csave__col-icon {
    flex-shrink: 0;
    display: inline-flex;
    color: var(--yl-col-c, var(--yl-text-secondary));
}

.yl-csave__col-label {
    font-size: 11px;
    font-weight: 700;
    color: var(--yl-col-c, var(--yl-text-primary));
    white-space: nowrap;
}

.yl-csave__col-count {
    margin-left: auto;
    flex-shrink: 0;
    font-family: var(--yl-font-mono);
    font-size: 9px;
    color: var(--yl-text-faint);
    white-space: nowrap;
}

.yl-csave__col.is-add {
    --yl-col-c: #67c23a;
}

.yl-csave__col.is-del {
    --yl-col-c: #f56c6c;
}

.yl-csave__col.is-append {
    --yl-col-c: var(--yl-gold);
}

.yl-csave__col.is-rename {
    --yl-col-c: #8f8fe8;
}

.yl-csave__col.is-remove {
    --yl-col-c: #e6a23c;
}

.yl-csave__col-body {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 7px;
}

.yl-csave__row {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 6px 7px;
    border-radius: var(--yl-radius-sm);
    background: rgba(255, 255, 255, 0.03);
}

.yl-csave__row-name {
    font-size: 11px;
    line-height: 1.5;
    color: var(--yl-text-primary);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.yl-csave__row.is-del .yl-csave__row-name {
    opacity: 0.6;
}

.yl-csave__row-target {
    font-size: 10px;
    color: var(--yl-text-faint);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* 只读配色预览（readonly-filter-block 的迷你形态） */
.yl-csave__chip {
    align-self: flex-start;
    font-size: 10px;
    line-height: 1;
    padding: 3px 7px;
    border-radius: 3px;
    border-width: 1px;
    border-style: solid;
    white-space: nowrap;
}

.yl-csave__val {
    font-size: 11px;
    line-height: 1.5;
    word-break: break-all;

    &.is-plus {
        color: #67c23a;
    }

    &.is-minus {
        color: #e6a23c;
        text-decoration: line-through;
    }

    &.is-old-val {
        color: var(--yl-text-faint);
        text-decoration: line-through;
        font-size: 10px;
    }

    &.is-new-val {
        color: #8f8fe8;
        font-weight: 700;
    }
}

.yl-csave__modal-foot {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 11px 14px;
    border-top: 1px solid var(--yl-border-plain);
}

.yl-csave__cancel {
    padding: 7px 16px;
    font-size: 12px;
    color: var(--yl-text-secondary);
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid var(--yl-border-plain);
    border-radius: var(--yl-radius);
    cursor: pointer;
    transition: border-color 0.2s ease, color 0.2s ease;

    &:hover:not(:disabled) {
        color: var(--yl-text-primary);
        border-color: var(--yl-border-strong);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
}

.yl-csave__confirm {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 7px 18px;
    font-size: 12px;
    font-weight: 700;
    color: #1b1305;
    background: linear-gradient(135deg, var(--yl-gold-bright), var(--yl-gold-deep));
    border: none;
    border-radius: var(--yl-radius);
    cursor: pointer;
    box-shadow: 0 2px 12px rgba(232, 162, 60, 0.3);
    transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease, opacity 0.2s ease;

    &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 16px rgba(232, 162, 60, 0.4);
    }

    &:disabled {
        opacity: 0.8;
        cursor: wait;
    }
}

.yl-csave__spin {
    width: 11px;
    height: 11px;
    border-radius: 50%;
    border: 2px solid rgba(27, 19, 5, 0.35);
    border-top-color: #1b1305;
    animation: yl-csave-spin 0.7s linear infinite;
}

@keyframes yl-csave-spin {
    to {
        transform: rotate(360deg);
    }
}

/* —— 底部截图 —— */
.yl-csave__shots {
    display: flex;
    gap: 14px;

    /* 缺图时 ShotThumb 整块不渲染，仅剩一格也保持独立宽度 */
    > :deep(.yl-shot) {
        flex: 1;
        min-width: 0;
        margin-top: 16px;
    }
}

/* —— 移动端：文案在上、演示在下，弹窗五列收成两列换行 —— */
@media (max-width: 959px) {
    .yl-act__badge {
        position: static;
        margin-left: 10px;
        vertical-align: 0.4em;
    }

    .yl-actcs__grid {
        grid-template-columns: 1fr;
        gap: 28px;
    }

    .yl-act__copy {
        order: -1;
    }

    .yl-panel {
        padding: 14px 14px 16px;
    }

    .yl-csave__body {
        min-height: 0;
    }

    .yl-csave__cols {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .yl-csave__hint {
        flex-wrap: wrap;
    }

    .yl-csave__foot {
        flex-wrap: wrap;
    }

    .yl-csave__note {
        margin-left: 0;
        width: 100%;
        text-align: right;
    }

    .yl-csave__shots {
        flex-direction: column;
    }
}
</style>
