<template>
    <section id="why" ref="root" class="yl-why">
        <!-- 区块头 -->
        <div class="yl-why__head">
            <p class="yl-why__kicker" data-rise>03 / WHY</p>
            <h2 class="yl-why__title" data-rise style="--d: 0.08s">一乐过滤的优势</h2>
            <p class="yl-why__desc" data-rise style="--d: 0.14s">超简单的可视化自定义，全量规则支持</p>
        </div>

        <div class="yl-why__body">
            <!-- 对比组：手动改过滤 vs 用一乐过滤（卡片头用 Show/Hide 语法呼应编辑器语言） -->
            <div class="yl-why__vs" data-rise style="--d: 0.2s">
                <!-- 左：手动改过滤（暗态 + 过滤代码装饰纹理） -->
                <article class="yl-why__card is-dim">
                    <div class="yl-why__code" aria-hidden="true">
                        <span><i class="is-kw">Show</i> <i class="is-cm"># 命运卡 - T1命运卡</i></span>
                        <span>    <i class="is-kw">SetTextColor</i> <i class="is-val">213 178 92</i></span>
                        <span>    <i class="is-kw">SetBackgroundColor</i> <i class="is-val">0 0 0 200</i></span>
                        <span>    <i class="is-kw">PlayAlertSound</i> <i class="is-val">1 300</i></span>
                    </div>
                    <p class="yl-why__card-tag"><i class="is-kw">Hide</i> # 手动改过滤</p>
                    <ul class="yl-why__points">
                        <li v-for="p in dimPoints" :key="p"><span class="yl-why__mark is-x" aria-hidden="true">×</span><span>{{ p }}</span></li>
                    </ul>
                </article>

                <!-- 中缝 VS 徽标（移动端隐藏） -->
                <span class="yl-why__vsbadge" aria-hidden="true">VS</span>

                <!-- 右：用一乐过滤（金亮态）——外层管进场，卡片自身管 hover 辉光，避免 transition 属性互相覆盖 -->
                <div class="yl-why__gold-wrap" data-rise style="--d: 0.26s">
                    <article class="yl-why__card is-gold">
                        <p class="yl-why__card-tag"><i class="is-kw">Show</i> # 用一乐过滤</p>
                        <ul class="yl-why__points">
                            <li v-for="p in goldPoints" :key="p.text">
                                <span class="yl-why__mark is-ok" aria-hidden="true">✓</span>
                                <span>{{ p.text }}<i v-if="p.tag" class="yl-why__ptag">{{ p.tag }}</i></span>
                            </li>
                        </ul>
                        <span class="yl-why__card-glow" aria-hidden="true" />
                    </article>
                </div>
            </div>

            <!-- 数字信任带（对齐 Hero 数据带手感） -->
            <div class="yl-why__stats" data-rise style="--d: 0.34s">
                <div v-for="s in stats" :key="s.label" class="yl-why__stat">
                    <b class="yl-why__stat-num">{{ s.num }}</b>
                    <span class="yl-why__stat-label">{{ s.label }}</span>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue"

// 为什么选择一乐过滤：静态说服区（签名叙事区与功能长廊之间的缓冲带）
// 无重交互无 GSAP，仅 data-rise 进场；对比/数字文案均为占位，待用户定稿

const dimPoints = [
    "语法太多，规则不熟悉，上手难度大",
    "赛季更新，一切从头再改",
    "纯英文编辑，物品名称不熟悉",
]

const goldPoints = [
    { text: "可视化中文编辑，新手也能轻松改" },
    { text: "云端保存，自定义跨赛季继承", tag: "POE1" },
    { text: "物价排序，通货、装备规划，主题编辑器等多项特色功能" },
]

const stats = [
    { num: "160,000+", label: "位流放者在用" },
    { num: "30+", label: "赛季持续更新" },
    { num: "2", label: "版本同步跟进（POE1 · POE2）" },
    { num: "40+", label: "公众号教程持续输出" },
    { num: "20+", label: "项功能覆盖编辑全流程" },
]

const root = ref<HTMLElement>()

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
})
</script>

<style scoped lang="scss">
.yl-why {
    width: min(var(--yl-container), 100%);
    margin-inline: auto;
    box-sizing: border-box;
    padding-inline: var(--yl-space-content);
    margin-top: clamp(64px, 9vh, 120px);
    padding-top: clamp(48px, 7vh, 88px);
    padding-bottom: clamp(64px, 9vh, 120px);
    border-top: 1px dashed var(--yl-border);
}

/* —— 进场（通用 data-rise） —— */
.yl-why.js-anim [data-rise] {
    opacity: 0;
    transform: translateY(24px);
}

.yl-why.js-anim.is-in [data-rise] {
    opacity: 1;
    transform: none;
    /* 注意：构建管线会吃掉 transition 简写里的 var()，必须拆成 longhand */
    transition-property: opacity, transform;
    transition-duration: 0.65s;
    transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
    transition-delay: var(--d, 0s);
}

/* —— 区块头 —— */
.yl-why__head {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    text-align: center;
    margin-bottom: clamp(32px, 5vh, 52px);
}

.yl-why__kicker {
    font-family: var(--yl-font-mono);
    font-size: 13px;
    letter-spacing: 0.22em;
    color: var(--yl-gold);
}

.yl-why__title {
    font-family: var(--yl-font-display);
    font-weight: 900;
    font-size: clamp(28px, 4vw, 44px);
    color: var(--yl-text-primary);
}

.yl-why__desc {
    max-width: 620px;
    line-height: 1.8;
    color: var(--yl-text-secondary);
}

.yl-why__body {
    display: flex;
    flex-direction: column;
    gap: clamp(36px, 5vh, 56px);
}

/* —— 对比组 —— */
.yl-why__vs {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: clamp(20px, 3vw, 36px);
    align-items: stretch;
}

.yl-why__gold-wrap {
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.yl-why__card {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 18px;
    border-radius: var(--yl-radius-lg);
    padding: 26px 28px 24px;
    overflow: hidden;
}

.yl-why__gold-wrap .yl-why__card {
    flex: 1;
}

.yl-why__card.is-dim {
    border: 1px solid var(--yl-border-plain);
    background: var(--yl-bg-elevated);
}

.yl-why__card.is-gold {
    border: 1px solid var(--yl-border-strong);
    background: linear-gradient(160deg, rgba(232, 162, 60, 0.08), var(--yl-bg-elevated) 55%);
    box-shadow: 0 0 36px rgba(232, 162, 60, 0.1);
    transition: box-shadow 0.3s ease, border-color 0.3s ease;

    &:hover {
        border-color: rgba(232, 162, 60, 0.5);
        box-shadow: 0 0 48px rgba(232, 162, 60, 0.18);
    }
}

/* 卡片头：Show/Hide 语法形态（呼应编辑器语言） */
.yl-why__card-tag {
    font-family: var(--yl-font-mono);
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.04em;

    .is-kw {
        font-style: normal;
        padding: 2px 8px;
        border-radius: var(--yl-radius-sm);
    }

    .is-dim & {
        color: var(--yl-text-faint);

        .is-kw {
            color: var(--yl-text-secondary);
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid var(--yl-border-plain);
        }
    }

    .is-gold & {
        color: var(--yl-gold-bright);

        .is-kw {
            color: #1b1305;
            background: linear-gradient(135deg, var(--yl-gold-bright), var(--yl-gold-deep));
        }
    }
}

/* 左卡装饰：过滤代码纹理（语法高亮配色，极低存在感） */
.yl-why__code {
    position: absolute;
    right: 14px;
    bottom: 10px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-family: var(--yl-font-mono);
    font-size: 11px;
    line-height: 1.5;
    white-space: pre;
    pointer-events: none;
    opacity: 0.45;

    i {
        font-style: normal;
        color: var(--yl-text-faint);

        &.is-kw {
            color: var(--yl-code-keyword);
        }

        &.is-val {
            color: var(--yl-code-value);
        }

        &.is-cm {
            color: var(--yl-code-comment);
        }
    }
}

/* 要点列表 */
.yl-why__points {
    display: flex;
    flex-direction: column;
    gap: 13px;
    margin: 0;
    padding: 0;
    list-style: none;

    li {
        display: flex;
        align-items: baseline;
        gap: 12px;
        font-size: 15px;
        line-height: 1.7;

        .is-dim & {
            color: var(--yl-text-secondary);
        }

        .is-gold & {
            color: var(--yl-text-primary);
            font-weight: 500;
        }
    }
}

.yl-why__mark {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    font-family: var(--yl-font-mono);
    font-size: 12px;
    font-weight: 700;
    border-radius: 50%;
    transform: translateY(1px);

    &.is-x {
        color: #f56c6c;
        border: 1px solid rgba(245, 108, 108, 0.4);
        background: rgba(245, 108, 108, 0.08);
    }

    &.is-ok {
        color: #67c23a;
        border: 1px solid rgba(103, 194, 58, 0.4);
        background: rgba(103, 194, 58, 0.08);
    }
}

/* 卖点行内版本徽标（同功能长廊幕徽标样式，行内跟随） */
.yl-why__ptag {
    font-style: normal;
    font-family: var(--yl-font-mono);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    line-height: 1.6;
    color: var(--yl-gold-bright);
    border: 1px solid var(--yl-border-strong);
    background: rgba(232, 162, 60, 0.08);
    border-radius: var(--yl-radius-sm);
    padding: 1px 6px;
    margin-left: 8px;
    vertical-align: 1px;
    white-space: nowrap;
}

/* 中缝 VS 徽标 */
.yl-why__vsbadge {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 46px;
    height: 46px;
    font-family: var(--yl-font-mono);
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: var(--yl-gold-bright);
    border: 1px solid var(--yl-border-strong);
    border-radius: 50%;
    background: var(--yl-bg-overlay);
    box-shadow: 0 0 18px rgba(232, 162, 60, 0.25);
}

/* 右卡角部辉光 */
.yl-why__card-glow {
    position: absolute;
    right: -40px;
    top: -40px;
    width: 160px;
    height: 160px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(232, 162, 60, 0.18), transparent 70%);
    pointer-events: none;
}

/* —— 数字信任带 —— */
.yl-why__stats {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    border-block: 1px dashed var(--yl-border);
    padding: 22px 0;
}

.yl-why__stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 0 12px;
    text-align: center;

    & + & {
        border-left: 1px solid var(--yl-border-plain);
    }
}

.yl-why__stat-num {
    font-family: var(--yl-font-mono);
    font-size: clamp(24px, 3vw, 32px);
    font-weight: 700;
    line-height: 1.1;
    color: var(--yl-gold);
    text-shadow: 0 0 18px rgba(232, 162, 60, 0.3);
}

.yl-why__stat-label {
    font-size: 13px;
    color: var(--yl-text-secondary);
}

/* —— 移动端：对比竖排（藏 VS）、数字 2×2 —— */
@media (max-width: 959px) {
    .yl-why__vs {
        grid-template-columns: 1fr;
    }

    .yl-why__vsbadge {
        display: none;
    }

    .yl-why__card {
        padding: 20px 18px;
    }

    .yl-why__code {
        display: none;
    }

    .yl-why__stats {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 18px 0;
    }

    /* 第五格 2×2 排不满，通栏居中 */
    .yl-why__stat {
        &:nth-child(3) {
            border-left: none;
        }

        &:nth-child(5) {
            grid-column: span 2;
            border-left: none;
        }
    }
}
</style>
