<template>
    <div ref="root" class="yl-act3">
        <div class="yl-act__grid yl-act3__grid">
            <!-- 左列：文案 -->
            <div class="yl-act__copy">
                <p class="yl-act__kicker" data-rise>功能长廊 · ACT 03 / 05</p>
                <h3 class="yl-act__title" data-rise style="--d: 0.06s">通货、宝石实时规划<span class="yl-act__badge">POE2</span></h3>
                <p class="yl-act__desc" data-rise style="--d: 0.12s">
                    通货规划器、宝石规划器，按实时物价从高到低排序、自动分档——档位跟着当前物价走。
                </p>
                <ul class="yl-act__list">
                    <li v-for="(s, i) in listCopy" :key="i" data-rise :style="{ '--d': 0.18 + i * 0.08 + 's' }">
                        <span class="yl-act__num">{{ String(i + 1).padStart(2, "0") }}</span>
                        <span>{{ s }}</span>
                    </li>
                </ul>
            </div>

            <!-- 右列：演示（通货 / 宝石规划器，形态同物价排序：左参考 / 右分级） -->
            <div class="yl-act__demo">
                <div ref="panel" class="yl-panel yl-plan" data-rise style="--d: 0.1s">
                    <div class="yl-panel__head">
                        <span class="yl-panel__dots" aria-hidden="true"><i /><i /><i /></span>
                        <span class="yl-panel__title">{{ activePlanner.key }} · {{ cat.label }}</span>
                    </div>

                    <!-- 顶层：规划器切换 -->
                    <div class="yl-plan__switch" data-rise style="--d: 0.12s">
                        <button
                            v-for="p in planners"
                            :key="p.key"
                            type="button"
                            :class="{ 'is-on': activePlanner.key === p.key }"
                            @click="setPlanner(p)"
                        >{{ p.key }}</button>
                    </div>

                    <!-- 通货规划器：子分类 tab -->
                    <div v-if="activePlanner.cats.length > 1" class="yl-plan__tabs" data-rise style="--d: 0.16s">
                        <button
                            v-for="c in activePlanner.cats"
                            :key="c.label"
                            type="button"
                            :class="{ 'is-on': cat.label === c.label }"
                            @click="setCat(c)"
                        >{{ c.label }}</button>
                    </div>

                    <div class="yl-plan__body" data-rise style="--d: 0.2s">
                        <!-- 左：物价列表参考（原序固定） -->
                        <div class="yl-plan__list">
                            <div v-for="it in cat.items" :key="activePlanner.key + it.name" class="yl-plan__row">
                                <span class="yl-plan__name">{{ it.name }}</span>
                                <span class="yl-plan__val">{{ fmt(it) }}<i>E</i></span>
                            </div>
                        </div>

                        <!-- 右：排序分级区 -->
                        <div class="yl-plan__tiers">
                            <div v-if="!sorted" class="yl-plan__empty">点击「按物价排序」生成分级</div>
                            <template v-else>
                                <div
                                    v-for="(g, gi) in tierGroups"
                                    :key="activePlanner.key + cat.label + g.tier"
                                    class="yl-plan__tgroup"
                                    :style="{ animationDelay: gi * 0.12 + 's' }"
                                >
                                    <span class="yl-plan__tlabel" :class="'is-t' + g.tier">T{{ g.tier }}</span>
                                    <span v-for="it in g.items" :key="it.name" class="yl-plan__chip" :class="'is-t' + g.tier">{{ it.name }}</span>
                                </div>
                            </template>
                        </div>
                    </div>

                    <div class="yl-plan__foot" data-rise style="--d: 0.26s">
                        <button type="button" class="yl-plan__btn" @click="toggleSort">
                            {{ sorted ? "恢复原序" : "按物价排序" }}
                        </button>
                        <span class="yl-plan__note">示例数据</span>
                    </div>
                </div>

                <!-- 编辑器实际界面：通货 / 宝石两张截图 -->
                <div class="yl-plan__shots" data-rise style="--d: 0.33s">
                    <ShotThumb
                        src="/assets/index/通货规划器.webp"
                        alt="编辑器通货规划器实际界面"
                        caption="编辑器实际界面 · 通货规划器"
                        pos="50% 8%"
                    />
                    <ShotThumb
                        src="/assets/index/宝石规划器.webp"
                        alt="编辑器宝石规划器实际界面"
                        caption="编辑器实际界面 · 宝石规划器（血脉辅助宝石）"
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

// POE2 规划器演示（第三幕 = 通货 + 宝石；装备规划器单开第四幕）
// 物品名取自 yl-editor poe2 真实数据（通货.json / 血脉辅助宝石.json）；价格为示例值（E 单位），用户校正
interface PlanItem {
    name: string
    price: number
}
interface PlanCat {
    label: string
    items: PlanItem[]
}
interface Planner {
    key: string
    cats: PlanCat[]
}

const planners: Planner[] = [
    {
        key: "通货规划器",
        cats: [
            {
                label: "符文",
                items: [
                    { name: "次级沙漠符文", price: 2 },
                    { name: "次级冰川符文", price: 1 },
                    { name: "次级风暴符文", price: 6 },
                    { name: "次级钢铁符文", price: 3 },
                    { name: "次级身躯符文", price: 14 },
                    { name: "次级心灵符文", price: 9 },
                ],
            },
            {
                label: "精华",
                items: [
                    { name: "次级身躯精华", price: 12 },
                    { name: "次级心灵精华", price: 8 },
                    { name: "次级强化精华", price: 3 },
                    { name: "次级磨蚀精华", price: 5 },
                    { name: "次级烈焰精华", price: 1 },
                    { name: "次级绝缘精华", price: 2 },
                ],
            },
            {
                label: "预兆",
                items: [
                    { name: "恢复预兆", price: 4 },
                    { name: "复苏预兆", price: 18 },
                    { name: "进步预兆", price: 7 },
                    { name: "消减预兆", price: 2 },
                    { name: "左旋消抹预兆", price: 11 },
                    { name: "右旋消抹预兆", price: 9 },
                ],
            },
            {
                label: "灵核",
                items: [
                    { name: "塔卡提的灵核", price: 26 },
                    { name: "欧佩罗蒂的灵核", price: 15 },
                    { name: "佳华尼的灵核", price: 8 },
                    { name: "扎拉迪的灵核", price: 21 },
                    { name: "奇塔夸雷特的灵核", price: 5 },
                    { name: "普华特的灵核", price: 12 },
                ],
            },
            {
                label: "雕像",
                items: [
                    { name: "巨熊雕像", price: 6 },
                    { name: "狂猿雕像", price: 3 },
                    { name: "雄鹿雕像", price: 16 },
                    { name: "野猪雕像", price: 2 },
                    { name: "毒蛇雕像", price: 24 },
                    { name: "恶狼雕像", price: 9 },
                ],
            },
        ],
    },
    {
        key: "宝石规划器",
        cats: [
            {
                label: "血脉辅助宝石",
                items: [
                    { name: "布鲁特斯之脑", price: 38 },
                    { name: "阿图鲁伊的放血术", price: 12 },
                    { name: "伊恩哈尔的魔物仪式", price: 22 },
                    { name: "厄罗克的熔炼术", price: 6 },
                    { name: "帕夸特的契约", price: 45 },
                    { name: "薇伦塔之推进", price: 3 },
                ],
            },
        ],
    },
]

const listCopy = [
    "通货规划器：符文 / 精华 / 预兆 / 灵核 / 雕像…",
    "宝石规划器：血脉辅助宝石",
    "按实时物价自动分档，配色自由修改",
    "分级结果一键写回过滤器规则",
]

const root = ref<HTMLElement>()
const planner = ref(planners[0])
const cat = ref(planners[0].cats[0])
const sorted = ref(false)

const activePlanner = computed(() => planner.value)

// 排序分级：价格降序后按名次分档——第1名 T1，2~3名 T2，其余 T3
const tierGroups = computed(() => {
    if (!sorted.value) return []
    const groups: { tier: number; items: PlanItem[] }[] = [
        { tier: 1, items: [] },
        { tier: 2, items: [] },
        { tier: 3, items: [] },
    ]
    const ordered = [...cat.value.items].sort((a, b) => b.price - a.price)
    ordered.forEach((it, rank) => {
        groups[rank === 0 ? 0 : rank <= 2 ? 1 : 2].items.push(it)
    })
    return groups.filter(g => g.items.length > 0)
})

function fmt(it: PlanItem): string {
    return it.price.toLocaleString()
}

function setPlanner(p: Planner) {
    if (planner.value.key === p.key) return
    planner.value = p
    cat.value = p.cats[0]
    sorted.value = false
}

function setCat(c: PlanCat) {
    if (cat.value.label === c.label) return
    cat.value = c
    sorted.value = false
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
.yl-act3 {
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

/* 第三幕回正：文案左、演示右 */
.yl-act3__grid {
    grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
}

/* —— 入场：淡入 + 上浮（对齐 Hero 副标题手感，逐项延迟见 --d） —— */
.yl-act3.js-anim [data-rise] {
    opacity: 0;
    transform: translateY(24px);
}

.yl-act3.js-anim.is-in [data-rise] {
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

/* 版本专属徽标：标题末字右上方（列间隙内，本幕 POE2 专属）；移动端回退为行内 */
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

/* —— 顶层规划器切换 —— */
.yl-plan__switch {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 10px;

    button {
        padding: 6px 16px;
        font-size: 14px;
        font-weight: 700;
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

/* —— 子分类 tab —— */
.yl-plan__tabs {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 12px;

    button {
        padding: 4px 12px;
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
.yl-plan__body {
    display: grid;
    grid-template-columns: minmax(0, 11fr) minmax(0, 9fr);
    gap: 12px;
    align-items: stretch;
}

.yl-plan__list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-height: 226px;
}

.yl-plan__row {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 10px;
    padding: 6px 10px;
    border-radius: var(--yl-radius-sm);
    background: rgba(0, 0, 0, 0.18);
}

.yl-plan__name {
    font-size: 13px;
    color: var(--yl-text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.yl-plan__val {
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

.yl-plan__tiers {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 10px;
    padding: 12px;
    border-radius: var(--yl-radius);
    background: rgba(0, 0, 0, 0.18);
    min-height: 226px;
}

.yl-plan__empty {
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

.yl-plan__tgroup {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 7px;
    animation: yl-act3-group-in 0.45s var(--yl-ease-out) both;
}

@keyframes yl-act3-group-in {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: none;
    }
}

.yl-plan__tlabel {
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

.yl-plan__chip {
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
.yl-plan__foot {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-top: 14px;
}

.yl-plan__btn {
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

.yl-plan__note {
    margin-left: auto;
    font-size: 11px;
    color: var(--yl-text-faint);
}

/* —— 双截图并排 —— */
.yl-plan__shots {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;

    :deep(.yl-shot) {
        margin-top: 16px;
    }
}

/* —— 移动端：文案在上、演示在下，主体竖排 —— */
@media (max-width: 959px) {
    /* 标题变短字号变小，徽标回退为行内跟随，避免越出屏宽 */
    .yl-act__badge {
        position: static;
        margin-left: 10px;
        vertical-align: 0.4em;
    }

    .yl-act3__grid {
        grid-template-columns: 1fr;
        gap: 28px;
    }

    .yl-panel {
        padding: 14px 14px 16px;
    }

    .yl-plan__body {
        grid-template-columns: 1fr;
    }

    .yl-plan__list,
    .yl-plan__tiers {
        min-height: 0;
    }

    .yl-plan__foot {
        flex-wrap: wrap;
        gap: 10px;
    }

    .yl-plan__note {
        margin-left: 0;
        width: 100%;
        text-align: right;
    }

    .yl-plan__shots {
        grid-template-columns: 1fr;
        gap: 0;
    }
}
</style>
