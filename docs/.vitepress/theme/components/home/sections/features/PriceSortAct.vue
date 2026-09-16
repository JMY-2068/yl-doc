<template>
    <div ref="root" class="yl-act2">
        <div class="yl-act__grid yl-act2__grid">
            <!-- 左列：文案 -->
            <div class="yl-act__copy">
                <p class="yl-act__kicker" data-rise>功能长廊 · ACT 03 / 07</p>
                <h3 class="yl-act__title" data-rise style="--d: 0.06s">物价排序，实时物价分级<span class="yl-act__badge">POE1</span></h3>
                <p class="yl-act__desc" data-rise style="--d: 0.12s">
                    命运卡、暗金、圣甲虫、卓越宝石、星团珠宝，按最新物价从高到低排序、自动分档——物价变了，分类T级跟着一键同步。
                </p>
                <ul class="yl-act__list">
                    <li v-for="(s, i) in listCopy" :key="i" data-rise :style="{ '--d': 0.18 + i * 0.08 + 's' }">
                        <span class="yl-act__num">{{ String(i + 1).padStart(2, "0") }}</span>
                        <span>{{ s }}</span>
                    </li>
                </ul>
            </div>

            <!-- 右列：演示（迷你物价排序，同编辑器"左参考 / 右分级"布局） -->
            <div class="yl-act__demo">
                <div ref="panel" class="yl-panel yl-price" data-rise style="--d: 0.1s">
                    <div class="yl-panel__head">
                        <span class="yl-panel__dots" aria-hidden="true"><i /><i /><i /></span>
                        <span class="yl-panel__title">物价排序 · {{ cat.label }}</span>
                        <div class="yl-price__src" role="group" aria-label="数据源">
                            <button type="button" :class="{ 'is-on': source === 'cn' }" @click="setSrc('cn')">国服</button>
                            <button type="button" :class="{ 'is-on': source === 'global' }" @click="setSrc('global')">国际服</button>
                        </div>
                    </div>

                    <div class="yl-price__tabs" data-rise style="--d: 0.12s">
                        <button
                            v-for="c in cats"
                            :key="c.label"
                            type="button"
                            :class="{ 'is-on': cat.label === c.label }"
                            @click="setCat(c)"
                        >{{ c.label }}</button>
                    </div>

                    <div class="yl-price__body" data-rise style="--d: 0.19s">
                        <!-- 左：物价列表参考（保持原序，仅数值随数据源变化） -->
                        <div class="yl-price__list">
                            <div v-for="it in cat.items" :key="cat.label + it.name" class="yl-price__row">
                                <span class="yl-price__name">{{ it.name }}</span>
                                <span class="yl-price__val">{{ fmt(it) }}<i>C</i></span>
                            </div>
                        </div>

                        <!-- 右：排序分级区（点排序后按档分组） -->
                        <div class="yl-price__tiers">
                            <div v-if="!sorted" class="yl-price__empty">点击「按物价排序」生成分级</div>
                            <template v-else>
                                <div
                                    v-for="(g, gi) in tierGroups"
                                    :key="cat.label + g.tier"
                                    class="yl-price__tgroup"
                                    :style="{ animationDelay: gi * 0.12 + 's' }"
                                >
                                    <span class="yl-price__tlabel" :class="'is-t' + g.tier">T{{ g.tier }}</span>
                                    <span v-for="it in g.items" :key="it.name" class="yl-price__chip" :class="'is-t' + g.tier">{{ it.name }}</span>
                                </div>
                            </template>
                        </div>
                    </div>

                    <div class="yl-price__foot" data-rise style="--d: 0.26s">
                        <button type="button" class="yl-price__btn" @click="toggleSort">
                            {{ sorted ? "恢复原序" : "按物价排序" }}
                        </button>
                        <span class="yl-price__note">示例数据</span>
                    </div>
                </div>

                <!-- 编辑器实际界面：窗框缩略图，点击放大 -->
                <div data-rise style="--d: 0.33s">
                    <ShotThumb
                        src="/assets/index/物价排序.webp"
                        alt="编辑器物价排序实际界面"
                        caption="编辑器实际界面 · 物价排序（T1–T5 按价格阈值分档）"
                        pos="50% 8%"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue"
import ShotThumb from "./ShotThumb.vue"

// 物价排序演示：物品名取自 yl-editor poe1 真实数据（json-data/poe1/*.json）
// 价格为示例数据（国服/国际服两套），仅作演示量级，用户后续可校正；不请求线上接口
// 布局同编辑器：左侧物价列表参考（原序），右侧点排序后生成 T1/T2/T3 分级区
type Source = "cn" | "global"
interface PriceItem {
    name: string
    cn: number
    global: number
}
interface Cat {
    label: string
    items: PriceItem[]
}

const cats: Cat[] = [
    {
        label: "命运卡",
        items: [
            { name: "谦逊", cn: 42, global: 55 },
            { name: "纯净帝王", cn: 6, global: 9 },
            { name: "觉醒", cn: 18, global: 24 },
            { name: "一股寒风", cn: 1, global: 2 },
            { name: "弃财求生", cn: 55, global: 41 },
            { name: "墨水点滴", cn: 2, global: 3 },
        ],
    },
    {
        label: "暗金",
        items: [
            { name: "法师之血", cn: 6200, global: 8400 },
            { name: "猎首", cn: 4100, global: 6200 },
            { name: "原初之罪", cn: 3100, global: 2600 },
            { name: "结晶全知", cn: 780, global: 640 },
            { name: "群星之灰", cn: 540, global: 980 },
            { name: "侍从", cn: 95, global: 60 },
        ],
    },
    {
        label: "圣甲虫",
        items: [
            { name: "虫群之裂隙圣甲虫", cn: 28, global: 35 },
            { name: "不稳之裂隙圣甲虫", cn: 8, global: 6 },
            { name: "元帅之裂隙圣甲虫", cn: 45, global: 52 },
            { name: "狂怒虫群之裂隙圣甲虫", cn: 15, global: 12 },
            { name: "增涌共鸣之裂隙圣甲虫", cn: 60, global: 48 },
            { name: "激增之制图者圣甲虫", cn: 5, global: 4 },
        ],
    },
    {
        label: "卓越宝石",
        items: [
            { name: "赋予(辅) 4级", cn: 380, global: 420 },
            { name: "增幅(辅) 4级", cn: 260, global: 300 },
            { name: "启蒙(辅) 4级", cn: 300, global: 340 },
            { name: "赋予(辅) 3级", cn: 35, global: 28 },
            { name: "增幅(辅) 3级", cn: 22, global: 18 },
            { name: "启蒙(辅) 3级", cn: 30, global: 25 },
        ],
    },
    {
        label: "星团珠宝",
        items: [
            { name: "[大]法术伤害", cn: 25, global: 31 },
            { name: "[大]攻击伤害", cn: 18, global: 22 },
            { name: "[大]元素伤害", cn: 12, global: 15 },
            { name: "[大]斧类和剑类伤害", cn: 8, global: 6 },
            { name: "[大]弓类伤害", cn: 15, global: 19 },
            { name: "[大]双持伤害", cn: 6, global: 5 },
        ],
    },
]

const listCopy = [
    "命运卡 / 暗金 / 圣甲虫 / 卓越宝石 / 星团珠宝",
    "国服、国际服双数据源，一键切换",
    "按价格自动分档，档位样式随价值",
    "排序结果一键写回过滤器规则",
]

const root = ref<HTMLElement>()
const cat = ref(cats[0])
const source = ref<Source>("cn")
const sorted = ref(false)

// 排序分级：价格降序后按名次分档——第1名 T1，2~3名 T2，其余 T3
const tierGroups = computed(() => {
    if (!sorted.value) return []
    const groups: { tier: number; items: PriceItem[] }[] = [
        { tier: 1, items: [] },
        { tier: 2, items: [] },
        { tier: 3, items: [] },
    ]
    const ordered = [...cat.value.items].sort((a, b) => b[source.value] - a[source.value])
    ordered.forEach((it, rank) => {
        groups[rank === 0 ? 0 : rank <= 2 ? 1 : 2].items.push(it)
    })
    return groups.filter(g => g.items.length > 0)
})

function fmt(it: PriceItem): string {
    return it[source.value].toLocaleString()
}

function setCat(c: Cat) {
    if (cat.value.label === c.label) return
    cat.value = c
    sorted.value = false
}

function setSrc(s: Source) {
    if (source.value === s) return
    source.value = s
    // 已排序状态下切数据源：分级区立即按新数据源重新分档，直观展示双源差异
}

function toggleSort() {
    sorted.value = !sorted.value
}

let io: IntersectionObserver | undefined
let riseFallback: ReturnType<typeof setTimeout> | undefined
let autoTimer: ReturnType<typeof setTimeout> | undefined
let autoPlayed = false

function riseIn() {
    root.value?.classList.add("is-in")
}

onMounted(() => {
    if (!root.value) return
    // 入场浮现 + 首次进入视口自动演示一遍排序
    root.value.classList.add("js-anim")
    io = new IntersectionObserver(
        (entries) => {
            if (entries.some(e => e.isIntersecting)) {
                // 双 rAF：先让隐藏初始态绘制一帧再触发过渡，修复"载入时已在视口内→无动画直接显示"
                requestAnimationFrame(() => requestAnimationFrame(riseIn))
                if (!autoPlayed) {
                    autoPlayed = true
                    autoTimer = setTimeout(() => {
                        sorted.value = true
                    }, 900)
                }
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
    if (autoTimer) clearTimeout(autoTimer)
})
</script>

<style scoped lang="scss">
.yl-act2 {
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

/* 第三幕正向：文案在左、演示在右 */
.yl-act2__grid {
    grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
}

/* —— 入场：淡入 + 上浮（对齐 Hero 副标题手感，逐项延迟见 --d） —— */
.yl-act2.js-anim [data-rise] {
    opacity: 0;
    transform: translateY(24px);
}

.yl-act2.js-anim.is-in [data-rise] {
    opacity: 1;
    transform: none;
    /* 注意：本站构建管线会吃掉 transition 简写里的 var()，必须拆成 longhand */
    transition-property: opacity, transform;
    transition-duration: 0.65s;
    transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
    transition-delay: var(--d, 0s);
}

/* —— 左列文案 —— */
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

.yl-act__desc {
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

/* —— 面板外壳（与第一幕同形态） —— */
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

/* —— 数据源切换 —— */
.yl-price__src {
    display: flex;
    border: 1px solid var(--yl-border-strong);
    border-radius: var(--yl-radius-sm);
    overflow: hidden;

    button {
        padding: 3px 10px;
        font-size: 12px;
        font-family: var(--yl-font-mono);
        color: var(--yl-text-secondary);
        background: transparent;
        border: none;
        cursor: pointer;
        transition: color 0.2s ease, background-color 0.2s ease;

        &.is-on {
            color: #1b1305;
            background: linear-gradient(135deg, var(--yl-gold-bright), var(--yl-gold-deep));
            font-weight: 700;
        }
    }
}

/* —— 分类 tab —— */
.yl-price__tabs {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 12px;

    button {
        padding: 5px 12px;
        font-size: 13px;
        color: var(--yl-text-secondary);
        background: rgba(0, 0, 0, 0.25);
        border: 1px solid var(--yl-border-plain);
        border-radius: 999px;
        cursor: pointer;
        transition: color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;

        &:hover {
            color: var(--yl-text-primary);
        }

        &.is-on {
            color: var(--yl-gold-bright);
            border-color: var(--yl-border-strong);
            background: rgba(232, 162, 60, 0.1);
        }
    }
}

/* —— 主体：左参考列表 / 右分级区 —— */
.yl-price__body {
    display: grid;
    grid-template-columns: minmax(0, 11fr) minmax(0, 9fr);
    gap: 12px;
    align-items: stretch;
}

/* 左：物价列表参考（原序固定） */
.yl-price__list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-height: 226px;
}

.yl-price__row {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 10px;
    padding: 6px 10px;
    border-radius: var(--yl-radius-sm);
    background: rgba(0, 0, 0, 0.18);
}

.yl-price__name {
    font-size: 13px;
    color: var(--yl-text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.yl-price__val {
    font-family: var(--yl-font-mono);
    font-size: 13px;
    font-weight: 700;
    color: var(--yl-text-primary);

    i {
        font-style: normal;
        font-size: 10px;
        font-weight: 400;
        color: var(--yl-text-faint);
        margin-left: 3px;
    }
}

/* 右：排序分级区 */
.yl-price__tiers {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 10px;
    padding: 12px;
    border-radius: var(--yl-radius);
    background: rgba(0, 0, 0, 0.18);
    min-height: 226px;
}

.yl-price__empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 12px;
    color: var(--yl-text-faint);
    border: 1px dashed var(--yl-border-plain);
    border-radius: var(--yl-radius-sm);
    padding: 18px 10px;
    text-align: center;
    line-height: 1.7;
}

.yl-price__tgroup {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 7px;
    animation: yl-act2-group-in 0.45s var(--yl-ease-out) both;
}

@keyframes yl-act2-group-in {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: none;
    }
}

.yl-price__tlabel {
    font-family: var(--yl-font-mono);
    font-size: 11px;
    font-weight: 700;
    text-align: center;
    border-radius: var(--yl-radius-sm);
    padding: 2px 7px;
    color: var(--yl-text-secondary);
    border: 1px solid var(--yl-border-plain);

    &.is-t1 {
        color: #1b1305;
        background: linear-gradient(135deg, var(--yl-gold-bright), var(--yl-gold-deep));
        border-color: transparent;
    }
}

.yl-price__chip {
    font-size: 12px;
    padding: 3px 9px;
    border-radius: 999px;
    border: 1px solid var(--yl-border-plain);
    color: var(--yl-text-secondary);
    white-space: nowrap;

    &.is-t1 {
        color: var(--yl-gold-bright);
        border-color: var(--yl-border-strong);
        background: rgba(232, 162, 60, 0.08);
        font-weight: 700;
    }

    &.is-t3 {
        color: var(--yl-text-faint);
    }
}

/* —— 底部：排序按钮 —— */
.yl-price__foot {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-top: 14px;
}

.yl-price__btn {
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

.yl-price__note {
    margin-left: auto;
    font-size: 11px;
    color: var(--yl-text-faint);
}

/* —— 移动端：文案在上、演示在下，主体竖排 —— */
@media (max-width: 959px) {
    /* 标题变短字号变小，徽标回退为行内跟随，避免越出屏宽 */
    .yl-act__badge {
        position: static;
        margin-left: 10px;
        vertical-align: 0.4em;
    }

    .yl-act2__grid {
        grid-template-columns: 1fr;
        gap: 28px;
    }

    .yl-act__copy {
        order: -1;
    }

    .yl-panel {
        padding: 14px 14px 16px;
    }

    .yl-price__body {
        grid-template-columns: 1fr;
    }

    .yl-price__list,
    .yl-price__tiers {
        min-height: 0;
    }

    .yl-price__foot {
        flex-wrap: wrap;
        gap: 10px;
    }

    .yl-price__note {
        margin-left: 0;
        width: 100%;
        text-align: right;
    }
}
</style>
