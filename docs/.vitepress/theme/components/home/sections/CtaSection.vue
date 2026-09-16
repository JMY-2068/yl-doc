<template>
    <section id="cta" ref="root" class="yl-cta">
        <!-- 终章背景：地平线金光（横线+底部辉光呼吸）+ 上升金尘（模板渲染，挂载后填充随机参数避免 SSG 水合错配） -->
        <div class="yl-cta__backdrop" aria-hidden="true">
            <span class="yl-cta__glow" />
            <span class="yl-cta__horizon" />
            <div class="yl-cta__dust">
                <i v-for="(d, i) in dustDots" :key="i" :style="{ left: d.left, '--sz': d.sz, '--dur': d.dur, '--delay': d.delay, '--drift': d.drift, '--rise': d.rise }" />
            </div>
            <!-- 掉落物图标彩蛋：真实物品图标落至地平线待机漂浮（呼应 Hero 掉落演出；CDN 同编辑器数据源） -->
            <div class="yl-cta__loot">
                <span v-for="t in lootIcons" :key="t.src" class="yl-cta__loot-item" :style="{ left: t.left, bottom: t.bottom, '--sz': t.sz, '--d': t.d, '--fd': t.fd }">
                    <i class="yl-cta__loot-float"><img :src="t.src" alt="" loading="lazy" @error="onIconError"></i>
                </span>
            </div>
        </div>

        <div class="yl-cta__inner">
            <p class="yl-cta__kicker" data-rise>07 / THE END</p>

            <!-- 大字收尾（站脚 slogan） -->
            <h2 class="yl-cta__title" data-rise style="--d: 0.1s">适合自己的过滤</h2>
            <h2 class="yl-cta__title" data-rise style="--d: 0.2s">才是<em>最好的过滤</em></h2>


        </div>
    </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue"

// CTA 终章：地平线金光 + 上升金尘 + 站脚 slogan 大字 + 掉落物图标彩蛋（纯视觉收尾）
// 版本徽章（移至 Hero 数据带）、公告行、用户数回响、双按钮均已按用户要求移除

const root = ref<HTMLElement>()

let io: IntersectionObserver | undefined
let riseFallback: ReturnType<typeof setTimeout> | undefined

function riseIn() {
    root.value?.classList.add("is-in")
}

// 上升金尘：挂载后生成随机参数（模板渲染拿 scoped 样式；SSR 时数组为空，无水合错配）
interface DustDot {
    left: string
    sz: string
    dur: string
    delay: string
    drift: string
    rise: string
}
const dustDots = ref<DustDot[]>([])

// 掉落物图标：POE1 走 poedb CDN（与编辑器 json 数据同源），POE2 走编辑器 public 直链；位置/大小/进场与漂浮相位手排
const lootIcons = [
    { src: "https://cdn.poedb.tw/image/Art/2DItems/Currency/CurrencyAddModToRare.webp", left: "11%", bottom: "24px", sz: "34px", d: "0.55s", fd: "0s" },
    { src: "https://cdn.poedb.tw/image/Art/2DItems/Currency/CurrencyModValues.webp", left: "21%", bottom: "60px", sz: "27px", d: "0.72s", fd: "-1.2s" },
    { src: "https://edit.filtereditor.cn/images/base/poe2/%E5%B4%87%E9%AB%98%E7%9F%B3.webp", left: "16%", bottom: "46px", sz: "26px", d: "0.6s", fd: "-0.9s" },
    { src: "https://edit.filtereditor.cn/images/base/poe2/%E7%A5%9E%E5%9C%A3%E7%9F%B3.webp", left: "27%", bottom: "28px", sz: "25px", d: "0.76s", fd: "-1.9s" },
    { src: "https://cdn.poedb.tw/image/Art/2DItems/Belts/Headhunter.webp", left: "32%", bottom: "18px", sz: "40px", d: "0.88s", fd: "-2.1s" },
    { src: "https://edit.filtereditor.cn/images/base/poe2/%E5%8D%A1%E5%85%B0%E5%BE%B7%E7%9A%84%E9%AD%94%E9%95%9C.webp", left: "44%", bottom: "66px", sz: "30px", d: "0.64s", fd: "-0.6s" },
    { src: "https://edit.filtereditor.cn/images/base/poe2/%E7%A0%B4%E6%BA%83%E5%AE%9D%E7%8F%A0.webp", left: "38%", bottom: "92px", sz: "26px", d: "0.68s", fd: "-2.3s" },
    { src: "https://cdn.poedb.tw/image/Art/2DItems/Rings/MirrorRing.webp", left: "56%", bottom: "44px", sz: "29px", d: "0.95s", fd: "-2.6s" },
    { src: "https://edit.filtereditor.cn/images/base/poe2/%E5%89%A5%E7%A6%BB%E7%9F%B3.webp", left: "61%", bottom: "14px", sz: "28px", d: "0.9s", fd: "-1.4s" },
    { src: "https://edit.filtereditor.cn/images/base/poe2/%E8%BE%9B%E6%A0%BC%E6%8B%89%E7%9A%84%E5%8F%91%E8%BE%AB.webp", left: "66%", bottom: "58px", sz: "31px", d: "0.8s", fd: "-1.7s" },
    { src: "https://cdn.poedb.tw/image/Art/2DItems/Belts/InjectorBelt.webp", left: "77%", bottom: "20px", sz: "38px", d: "1s", fd: "-2.9s" },
    { src: "https://cdn.poedb.tw/image/Art/2DItems/Currency/CurrencyRerollRare.webp", left: "88%", bottom: "48px", sz: "30px", d: "1.1s", fd: "-3.3s" },
    { src: "https://cdn.poedb.tw/image/Art/2DItems/Currency/CurrencyVaal.webp", left: "50%", bottom: "86px", sz: "24px", d: "1.2s", fd: "-3s" },
    { src: "https://edit.filtereditor.cn/images/base/poe2/%E6%B7%B7%E6%B2%8C%E7%9F%B3.webp", left: "82%", bottom: "74px", sz: "26px", d: "1s", fd: "-3.6s" },
    { src: "https://edit.filtereditor.cn/images/base/poe2/%E7%93%A6%E5%B0%94%E5%AE%9D%E7%8F%A0.webp", left: "55%", bottom: "96px", sz: "21px", d: "1.15s", fd: "-4.2s" },
]

function onIconError(e: Event) {
    const img = e.target as HTMLImageElement
    img.closest(".yl-cta__loot-item")?.classList.add("is-hidden")
}

function rollDust(): DustDot[] {
    const count = innerWidth < 960 ? 7 : 14
    return Array.from({ length: count }, () => ({
        left: `${4 + Math.random() * 92}%`,
        sz: `${2 + Math.random() * 2.5}px`,
        dur: `${6 + Math.random() * 6}s`,
        delay: `${-Math.random() * 10}s`,
        drift: `${(Math.random() - 0.5) * 60}px`,
        rise: `${-140 - Math.random() * 130}px`,
    }))
}

onMounted(() => {
    dustDots.value = rollDust()
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
        { threshold: 0.3 },
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
.yl-cta {
    position: relative;
    width: min(var(--yl-container), 100%);
    margin-inline: auto;
    box-sizing: border-box;
    padding-inline: var(--yl-space-content);
    margin-top: clamp(64px, 9vh, 120px);
    padding-top: clamp(56px, 9vh, 110px);
    padding-bottom: clamp(96px, 14vh, 160px);
    border-top: 1px dashed var(--yl-border);
    text-align: center;
    overflow: hidden;
}

/* —— 终章背景：底部辉光呼吸 + 地平线金线 —— */
.yl-cta__backdrop {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
}

.yl-cta__glow {
    position: absolute;
    bottom: -120px;
    left: 50%;
    width: min(820px, 110%);
    height: 300px;
    transform: translateX(-50%);
    border-radius: 50%;
    background: radial-gradient(ellipse at center, rgba(232, 162, 60, 0.18), transparent 65%);
    animation: yl-cta-glow-breathe 4.5s ease-in-out infinite;
}

@keyframes yl-cta-glow-breathe {
    0%, 100% {
        opacity: 0.6;
    }

    50% {
        opacity: 1;
    }
}

/* 地平线：底部横贯金线 + 线下柔光，微弱流光明灭 */
.yl-cta__horizon {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 130px;
    background: linear-gradient(to top, rgba(232, 162, 60, 0.12), transparent 80%);

    &::after {
        content: "";
        position: absolute;
        left: 6%;
        right: 6%;
        bottom: 0;
        height: 2px;
        border-radius: 2px;
        background: linear-gradient(90deg, transparent, rgba(244, 188, 94, 0.55) 28%, rgba(244, 188, 94, 0.85) 50%, rgba(244, 188, 94, 0.55) 72%, transparent);
        box-shadow: 0 0 16px rgba(232, 162, 60, 0.45), 0 6px 42px rgba(232, 162, 60, 0.3);
        animation: yl-cta-horizon-shimmer 5s ease-in-out infinite;
    }
}

@keyframes yl-cta-horizon-shimmer {
    0%, 100% {
        opacity: 0.75;
    }

    50% {
        opacity: 1;
    }
}

/* —— 掉落物图标彩蛋：外层管进场（坠落+回弹），内层管待机漂浮 —— */
.yl-cta__loot {
    position: absolute;
    inset: 0;
    pointer-events: none;
}

.yl-cta__loot-item {
    position: absolute;
    opacity: 0;
    transform: translateY(-72px);
    transition-property: opacity, transform;
    transition-duration: 0.75s;
    transition-timing-function: cubic-bezier(0.34, 1.4, 0.64, 1);
    transition-delay: var(--d, 0.6s);

    &.is-hidden {
        display: none;
    }
}

.yl-cta.is-in .yl-cta__loot-item {
    opacity: 1;
    transform: translateY(0);
}

.yl-cta__loot-float {
    display: block;
    animation: yl-cta-loot-bob 3.4s ease-in-out var(--fd, 0s) infinite alternate;

    img {
        display: block;
        width: var(--sz, 32px);
        height: auto;
        filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.55)) drop-shadow(0 0 6px rgba(232, 162, 60, 0.18));
    }
}

@keyframes yl-cta-loot-bob {
    from {
        transform: translateY(0);
    }

    to {
        transform: translateY(-6px);
    }
}

/* —— 上升金尘 —— */
.yl-cta__dust {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;

    i {
        position: absolute;
        bottom: -8px;
        width: var(--sz, 3px);
        height: var(--sz, 3px);
        border-radius: 50%;
        background: var(--yl-gold-bright);
        box-shadow: 0 0 6px rgba(244, 188, 94, 0.55);
        opacity: 0;
        animation: yl-cta-dust-rise var(--dur, 8s) ease-in var(--delay, 0s) infinite;
    }
}

@keyframes yl-cta-dust-rise {
    0% {
        opacity: 0;
        transform: translate(0, 0);
    }

    18% {
        opacity: 0.55;
    }

    80% {
        opacity: 0.28;
    }

    100% {
        opacity: 0;
        transform: translate(var(--drift, 0px), var(--rise, -180px));
    }
}

/* —— 内容层 —— */
.yl-cta__inner {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;
    /* 拉开大字与底部掉落图标的间距（内容顶锚，加底部外边距把整段撑高） */
    margin-bottom: clamp(120px, 16vh, 200px);
}

.yl-cta.js-anim [data-rise] {
    opacity: 0;
    transform: translateY(24px);
}

.yl-cta.js-anim.is-in [data-rise] {
    opacity: 1;
    transform: none;
    /* 注意：构建管线会吃掉 transition 简写里的 var()，必须拆成 longhand */
    transition-property: opacity, transform;
    transition-duration: 0.65s;
    transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
    transition-delay: var(--d, 0s);
}

.yl-cta__kicker {
    font-family: var(--yl-font-mono);
    font-size: 13px;
    letter-spacing: 0.22em;
    color: var(--yl-gold);
}

/* —— 大字 —— */
.yl-cta__title {
    margin: 0;
    font-family: var(--yl-font-display);
    font-weight: 900;
    font-size: clamp(30px, 4.8vw, 56px);
    line-height: 1.3;
    color: var(--yl-text-primary);
    text-shadow: 0 0 40px rgba(232, 162, 60, 0.15);

    em {
        font-style: normal;
        background: linear-gradient(135deg, var(--yl-gold-bright), var(--yl-gold-deep));
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
    }
}

/* —— 移动端 —— */
@media (max-width: 959px) {
    .yl-cta {
        overflow: hidden;
    }

    .yl-cta__glow {
        bottom: -90px;
        height: 220px;
    }

    .yl-cta__horizon {
        height: 96px;
    }

    .yl-cta__loot-float img {
        width: calc(var(--sz, 32px) * 0.72);
    }

}
</style>
