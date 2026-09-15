<template>
    <div ref="root" class="yl-act1">
        <div class="yl-act__grid">
            <!-- 左列：文案 -->
            <div class="yl-act__copy">
                <p class="yl-act__kicker" data-rise>功能长廊 · ACT 01 / 05</p>
                <h3 class="yl-act__title" data-rise style="--d: 0.06s">可视化编辑，所见即所得</h3>
                <p class="yl-act__desc" data-rise style="--d: 0.12s">
                    不用学习过滤语法——颜色、字号、光柱，在编辑面板里实时修改，实时预览。
                </p>
                <ul class="yl-act__list">
                    <li v-for="(s, i) in listCopy" :key="i" data-rise :style="{ '--d': 0.18 + i * 0.08 + 's' }">
                        <span class="yl-act__num">{{ String(i + 1).padStart(2, "0") }}</span>
                        <span>{{ s }}</span>
                    </li>
                </ul>
            </div>

            <!-- 右列：演示（迷你编辑面板 + 游戏地面预览） -->
            <div class="yl-act__demo">
                <div class="yl-panel" data-rise style="--d: 0.1s">
                    <div class="yl-panel__head">
                        <span class="yl-panel__dots" aria-hidden="true"><i /><i /><i /></span>
                        <span class="yl-panel__title">规则编辑 · 神圣石</span>
                        <span class="yl-panel__tag">Show</span>
                    </div>

                    <div class="yl-ctrl" data-rise style="--d: 0.12s">
                        <span class="yl-ctrl__label">文字颜色</span>
                        <div class="yl-ctrl__swatches">
                            <button
                                v-for="(c, i) in textColors"
                                :key="c"
                                type="button"
                                class="yl-ctrl__swatch"
                                :class="{ 'is-picked': textIdx === i }"
                                :style="{ '--c': c }"
                                :aria-label="`文字颜色 ${i + 1}`"
                                @click="textIdx = i"
                            />
                        </div>
                    </div>

                    <div class="yl-ctrl" data-rise style="--d: 0.19s">
                        <span class="yl-ctrl__label">背景颜色</span>
                        <div class="yl-ctrl__swatches">
                            <button
                                v-for="(c, i) in bgColors"
                                :key="c"
                                type="button"
                                class="yl-ctrl__swatch"
                                :class="{ 'is-picked': bgIdx === i }"
                                :style="{ '--c': c }"
                                :aria-label="`背景颜色 ${i + 1}`"
                                @click="bgIdx = i"
                            />
                        </div>
                    </div>

                    <div class="yl-ctrl" data-rise style="--d: 0.26s">
                        <span class="yl-ctrl__label">边框颜色</span>
                        <div class="yl-ctrl__swatches">
                            <button
                                v-for="(c, i) in borderColors"
                                :key="c"
                                type="button"
                                class="yl-ctrl__swatch"
                                :class="{ 'is-picked': borderIdx === i }"
                                :style="{ '--c': c }"
                                :aria-label="`边框颜色 ${i + 1}`"
                                @click="borderIdx = i"
                            />
                        </div>
                    </div>

                    <div class="yl-ctrl" data-rise style="--d: 0.33s">
                        <span class="yl-ctrl__label">字号</span>
                        <div class="yl-ctrl__stepper">
                            <button type="button" aria-label="减小字号" @click="stepFs(-1)">−</button>
                            <span class="yl-ctrl__fs">{{ fsGame }}</span>
                            <button type="button" aria-label="增大字号" @click="stepFs(1)">+</button>
                        </div>
                    </div>

                    <div class="yl-ctrl" data-rise style="--d: 0.4s">
                        <span class="yl-ctrl__label">光柱</span>
                        <button
                            type="button"
                            class="yl-ctrl__toggle"
                            :class="{ 'is-on': beamOn }"
                            role="switch"
                            :aria-checked="beamOn"
                            aria-label="光柱开关"
                            @click="beamOn = !beamOn"
                        >
                            <i />
                        </button>
                    </div>

                    <div class="yl-ctrl" data-rise style="--d: 0.47s">
                        <span class="yl-ctrl__label">小地图图标</span>
                        <button
                            type="button"
                            class="yl-ctrl__toggle"
                            :class="{ 'is-on': iconOn }"
                            role="switch"
                            :aria-checked="iconOn"
                            aria-label="小地图图标开关"
                            @click="iconOn = !iconOn"
                        >
                            <i />
                        </button>
                    </div>
                </div>

                <div class="yl-ground" data-rise style="--d: 0.18s">
                    <div class="yl-ground__drop">
                        <div class="yl-ground__plate" :style="plateStyle">
                            <img
                                v-if="iconOn"
                                class="yl-ground__icon"
                                :src="ICON"
                                alt=""
                                @error="hideImg"
                            >
                            神圣石
                        </div>
                        <!-- 光柱：编辑器同款 PlayEffect 素材（cross-Red.svg，线上直链），开关驱动升起 -->
                        <img
                            class="yl-ground__beam"
                            :class="{ 'is-on': beamOn }"
                            :src="BEAM"
                            alt=""
                            @error="hideImg"
                        >
                    </div>
                </div>

                <!-- 编辑器实际界面：窗框缩略图，点击放大 -->
                <div data-rise style="--d: 0.4s">
                    <ShotThumb
                        src="/assets/index/可视化编辑.webp"
                        alt="编辑器规则编辑实际界面"
                        caption="编辑器实际界面 · 规则编辑（颜色 / 字号 / 光柱实时预览）"
                        pos="50% 0%"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue"
import ShotThumb from "./ShotThumb.vue"

// 演示物品：神圣石；预览状态完全由面板控件驱动
// 初始即为真实过滤终态：白底红框红字 + CircleRed 小地图图标 + PlayEffect Red 光柱
// 图片资源在线直链 yl-editor 线上站点，不复制到本仓库；地面背景 back1.png 直接写在 SCSS 里
const ICON = "https://edit.filtereditor.cn/images/drop/icon_CircleRed.png"
const BEAM = "https://edit.filtereditor.cn/images/cross/cross-Red.svg"

const textColors = ["rgb(150, 141, 121)", "#ff0000", "#e8a23c", "#8888ff", "#2cd898"]
const bgColors = ["rgb(13, 12, 10)", "#ffffff", "rgba(255, 40, 0, 0.92)", "#171208"]
const borderColors = ["transparent", "#ff0000", "#e8a23c", "#8888ff"]

const listCopy = [
    "文字 / 背景 / 边框颜色，色板直选",
    "字号实时预览，不再盲调",
    "光柱、小地图图标，一键开启关闭",
    "全量规则可自定义",
]

const root = ref<HTMLElement>()

const textIdx = ref(1)
const bgIdx = ref(1)
const borderIdx = ref(1)
const fsGame = ref(45)
const beamOn = ref(true)
const iconOn = ref(true)

// 名牌字号换算：编辑器 filter-block 公式 (SetFontSize + 15) / 2，演示再放大 1.5 倍便于观看
const plateStyle = computed(() => ({
    color: textColors[textIdx.value],
    background: bgColors[bgIdx.value],
    borderColor: borderColors[borderIdx.value],
    fontSize: `${(((fsGame.value + 15) / 2) * 1.5).toFixed(1)}px`,
}))

function stepFs(d: number) {
    fsGame.value = Math.min(45, Math.max(12, fsGame.value + d))
}
function hideImg(e: Event) {
    ;(e.target as HTMLImageElement).style.display = "none"
}

let io: IntersectionObserver | undefined
let riseFallback: ReturnType<typeof setTimeout> | undefined

function riseIn() {
    root.value?.classList.add("is-in")
}

onMounted(() => {
    if (!root.value) return
    // 入场：左列卖点与编辑面板行从下往上依次浮现（js-anim 由 JS 添加，无 JS 时保持可见）
    root.value.classList.add("js-anim")
    io = new IntersectionObserver(
        (entries) => {
            if (entries.some(e => e.isIntersecting)) {
                // 双 rAF：先让隐藏初始态绘制一帧再触发过渡，修复"载入时已在视口内→无动画直接显示"
                requestAnimationFrame(() => requestAnimationFrame(riseIn))
                io?.disconnect()
            }
        },
        { threshold: 0.2 },
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
.yl-act1 {
    width: min(var(--yl-container), 100%);
    margin-inline: auto;
    box-sizing: border-box;
    padding-inline: var(--yl-space-content);
}

.yl-act__grid {
    display: grid;
    grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
    gap: clamp(36px, 5vw, 72px);
    align-items: center;
}

/* —— 入场：淡入 + 上浮（对齐 Hero 副标题手感，逐项延迟见 --d） —— */
.yl-act1.js-anim [data-rise] {
    opacity: 0;
    transform: translateY(24px);
}

.yl-act1.js-anim.is-in [data-rise] {
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
    font-family: var(--yl-font-display);
    font-weight: 900;
    font-size: clamp(26px, 3.4vw, 38px);
    color: var(--yl-text-primary);
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

/* —— 右列：迷你编辑面板 —— */
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
    margin-bottom: 10px;
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
}

.yl-panel__tag {
    font-family: var(--yl-font-mono);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: #1b1305;
    background: linear-gradient(135deg, var(--yl-gold-bright), var(--yl-gold-deep));
    border-radius: var(--yl-radius-sm);
    padding: 2px 8px;
}

.yl-ctrl {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 9px 12px;
    border-radius: var(--yl-radius);

    & + & {
        margin-top: 4px;
    }
}

.yl-ctrl__label {
    width: 68px;
    flex: none;
    font-size: 13px;
    color: var(--yl-text-secondary);
}

.yl-ctrl__swatches {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.yl-ctrl__swatch {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: var(--c);
    border: 2px solid rgba(255, 255, 255, 0.12);
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
        transform: scale(1.12);
    }

    &.is-picked {
        box-shadow: 0 0 0 2px var(--yl-bg-elevated), 0 0 0 4px var(--yl-gold);
        transform: scale(1.08);
    }
}

.yl-ctrl__stepper {
    display: flex;
    align-items: center;
    gap: 12px;

    button {
        width: 30px;
        height: 30px;
        border-radius: var(--yl-radius-sm);
        border: 1px solid var(--yl-border-strong);
        background: transparent;
        color: var(--yl-gold);
        font-size: 16px;
        line-height: 1;
        cursor: pointer;
        transition: background-color 0.2s ease;

        &:hover {
            background: rgba(232, 162, 60, 0.12);
        }
    }
}

.yl-ctrl__fs {
    min-width: 2ch;
    text-align: center;
    font-family: var(--yl-font-mono);
    font-size: 16px;
    font-weight: 700;
    color: var(--yl-text-primary);
}

.yl-ctrl__toggle {
    position: relative;
    width: 44px;
    height: 24px;
    border-radius: 12px;
    border: 1px solid var(--yl-border-strong);
    background: rgba(0, 0, 0, 0.4);
    cursor: pointer;
    transition: background-color 0.3s ease, border-color 0.3s ease;

    i {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--yl-text-faint);
        transition-property: left, background-color;
        transition-duration: 0.3s;
        transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
    }

    &.is-on {
        border-color: transparent;
        background: linear-gradient(135deg, var(--yl-gold-bright), var(--yl-gold-deep));

        i {
            left: 22px;
            background: #1b1305;
        }
    }
}

/* —— 游戏地面预览 —— */
.yl-ground {
    position: relative;
    margin-top: 18px;
    height: clamp(220px, 30vh, 300px);
    border-radius: var(--yl-radius-lg);
    border: 1px solid var(--yl-border-plain);
    background: var(--yl-bg-elevated) url("https://edit.filtereditor.cn/images/drop/back1.png") center / cover no-repeat;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;

    &::before {
        content: "";
        position: absolute;
        inset: 0;
        background: radial-gradient(120% 90% at 50% 40%, transparent 40%, rgba(11, 11, 15, 0.55));
        pointer-events: none;
    }
}

.yl-ground__drop {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 10px;
}

.yl-ground__plate {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: var(--yl-font-display);
    font-weight: 700;
    letter-spacing: 0.06em;
    line-height: 1;
    padding: 6px 12px;
    border: 1px solid;
    border-radius: 2px;
    white-space: nowrap;
    box-shadow: 0 3px 16px rgba(0, 0, 0, 0.6);
    transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, font-size 0.2s ease;
}

.yl-ground__icon {
    display: block;
    width: 20px;
    height: auto;
    image-rendering: pixelated;
    animation: yl-act1-icon-in 0.35s var(--yl-ease-out);
}

@keyframes yl-act1-icon-in {
    from {
        opacity: 0;
        transform: scale(0.6);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

/* 光柱：编辑器同款 PlayEffect 素材图（cross-Red.svg），名牌右侧，开关驱动升起 */
.yl-ground__beam {
    flex: none;
    height: clamp(110px, 15vh, 145px);
    width: auto;
    transform-origin: bottom center;
    transform: scaleY(0);
    opacity: 0;
    transition-property: opacity, transform;
    transition-duration: 0.5s;
    transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
    filter: drop-shadow(0 0 10px rgba(255, 40, 0, 0.35));
    pointer-events: none;

    &.is-on {
        opacity: 1;
        transform: scaleY(1);
    }
}

/* —— 移动端：竖排，控件可点 —— */
@media (max-width: 959px) {
    .yl-act__grid {
        grid-template-columns: 1fr;
        gap: 28px;
    }

    .yl-panel {
        padding: 14px 14px 16px;
    }

    .yl-ctrl {
        gap: 12px;
        padding: 8px 10px;
    }

    .yl-ctrl__label {
        width: auto;
        min-width: 68px;
    }

    .yl-ground {
        height: 200px;
        margin-top: 16px;
    }
}
</style>
