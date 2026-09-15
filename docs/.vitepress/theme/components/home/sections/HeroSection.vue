<template>
    <section id="hero" ref="root" class="yl-hero">
        <!-- 光锚定在品牌组合正后方的小光晕 + 上浮金尘粒子（JS 注入） -->
        <div class="yl-hero__halo" aria-hidden="true"></div>
        <div ref="dust" class="yl-hero__dust" aria-hidden="true"></div>

        <!-- 背景装饰：经典通货的过滤掉落效果（名牌 + 光柱，样式取自真实过滤规则，仅桌面显示） -->
        <div class="yl-hero__drops yl-hero__drops--left" aria-hidden="true">
            <div v-for="d in leftDrops" :key="d.name" class="yl-drop" :style="dropVars(d)">
                <span v-if="d.beam" class="yl-drop__beam"></span>
                <span class="yl-drop__label">{{ d.name }}</span>
            </div>
        </div>
        <div class="yl-hero__drops yl-hero__drops--right" aria-hidden="true">
            <div v-for="d in rightDrops" :key="d.name" class="yl-drop" :style="dropVars(d)">
                <span v-if="d.beam" class="yl-drop__beam"></span>
                <span class="yl-drop__label">{{ d.name }}</span>
            </div>
        </div>

        <div class="yl-hero__content">
            <img class="yl-hero__logo" src="/logo.webp" alt="一乐过滤" width="96" height="96" />
            <h1 class="yl-hero__title">一乐过滤</h1>
            <div class="yl-hero__underline" aria-hidden="true"></div>
            <div class="yl-hero__subtitle">
                <p class="yl-hero__subtitle-main">国服最好用的过滤编辑工具</p>
                <p class="yl-hero__subtitle-sub">简单、高效、灵活、高度自定义</p>
            </div>

            <div class="yl-hero__actions">
                <a class="yl-btn yl-btn--primary" href="https://edit.filtereditor.cn/" target="_blank" rel="noopener">打开编辑器</a>
                <a class="yl-btn yl-btn--ghost" href="https://mp.weixin.qq.com/s/Axm4ucwmJ6-642G8G7kQfA" target="_blank" rel="noopener">物价榜介绍</a>
                <a class="yl-btn yl-btn--ghost" href="/download.html">下载懒人包</a>
                <a class="yl-btn yl-btn--ghost" href="/base/intro.html">先看教程</a>
            </div>

            <div class="yl-hero__stats">
                <p class="yl-hero__count">已有 <strong id="yl-user-count">0</strong> 位流放者加入</p>
                <div class="yl-hero__versions">
                    <span class="yl-chip">POE1 v3.29.2</span>
                    <span class="yl-chip">POE2 v2.0.8</span>
                </div>
            </div>
        </div>

        <div class="yl-hero__scroll" aria-hidden="true"><span>向下滚动</span><i></i></div>
    </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue"
import gsap from "gsap"
import { SplitText } from "gsap/SplitText"

const root = ref<HTMLElement>()
const dust = ref<HTMLElement>()

// 经典通货的过滤块样式（颜色/字号对应真实过滤规则，字号按游戏字号 ~0.32 缩放）
// dx: 水平散落偏移(mt 垂直错落/高度)——打破垂直堆叠，模拟真实掉落的自然感
interface Drop {
    name: string
    text: string
    bg: string
    border: string
    fs: number
    beam?: string
    dx?: number
    mt?: number
    bh?: number
}

const leftDrops: Drop[] = [
    { name: "卡兰德的魔镜", text: "#ffffff", bg: "rgba(255, 40, 0, 0.92)", border: "transparent", fs: 15, beam: "#ff2800", dx: 0, mt: 0, bh: 72 },
    { name: "毁灭者之弓", text: "rgb(255, 255, 0)", bg: "rgb(75, 75, 0)", border: "rgb(220, 220, 0)", fs: 13, dx: 34, mt: 48 },
    { name: "重革腰带", text: "rgb(180, 96, 0)", bg: "#ffffff", border: "rgb(255, 0, 0)", fs: 14, beam: "#ff2800", dx: 10, mt: 38, bh: 66 },
    { name: "崇高石", text: "#000000", bg: "rgb(247, 156, 110)", border: "#000000", fs: 12, dx: 48, mt: 54 },
]

const rightDrops: Drop[] = [
    { name: "神圣石", text: "#ff0000", bg: "#ffffff", border: "#ff0000", fs: 14, beam: "#ff2800", dx: 0, mt: 0, bh: 62 },
    { name: "贪婪战书", text: "rgb(44, 218, 152)", bg: "rgb(11, 57, 39)", border: "rgb(44, 218, 152)", fs: 13, dx: -26, mt: 50 },
    { name: "高级混沌石", text: "rgb(217, 102, 111)", bg: "#ffffff", border: "rgb(217, 102, 111)", fs: 13, beam: "#d9666f", dx: -10, mt: 42, bh: 58 },
]

// 光柱配色衍生：核心色向白混（炽亮感）、辉光两级透明度
function hexToRgb(hex: string): [number, number, number] {
    const n = parseInt(hex.slice(1), 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function mixWhite(hex: string, t: number): string {
    const [r, g, b] = hexToRgb(hex)
    const mix = (c: number) => Math.round(c + (255 - c) * t)
    return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`
}

function dropVars(d: Drop): Record<string, string> {
    return {
        "--text": d.text,
        "--bg": d.bg,
        "--border": d.border,
        "--fs": `${d.fs}px`,
        "--beam": d.beam ?? "transparent",
        "--beam-core": d.beam ? mixWhite(d.beam, 0.62) : "transparent",
        "--beam-glow": d.beam ? `${d.beam}66` : "transparent",
        "--beam-glow-soft": d.beam ? `${d.beam}30` : "transparent",
        "--dx": `${d.dx ?? 0}px`,
        "--mt": `${d.mt ?? 0}px`,
        "--bh": `${d.bh ?? 66}px`,
    }
}

// 金色浮尘：随机撒 N 颗小光点，缓慢上浮并淡出，循环
function spawnDust(container: HTMLElement) {
    const count = window.matchMedia("(max-width: 767px)").matches ? 8 : 16
    for (let i = 0; i < count; i++) {
        const dot = document.createElement("i")
        const size = 1.5 + Math.random() * 1.5
        dot.style.left = `${5 + Math.random() * 90}%`
        dot.style.top = `${15 + Math.random() * 75}%`
        dot.style.width = `${size}px`
        dot.style.height = `${size}px`
        container.appendChild(dot)
        gsap.fromTo(dot,
            { y: 0, autoAlpha: 0 },
            {
                y: -(30 + Math.random() * 50),
                autoAlpha: 0.5,
                duration: 4 + Math.random() * 4,
                delay: Math.random() * 6,
                repeat: -1,
                ease: "sine.out",
            },
        )
    }
}

let mm: gsap.MatchMedia | undefined

// 用户数：先走 dev 代理相对路径，失败再直连生产 API
async function fetchCount(): Promise<number | null> {
    const urls = ["/api/v1/user/count", "https://api.filtereditor.cn/prod/v1/user/count"]
    for (const url of urls) {
        try {
            const res = await fetch(url)
            const data = await res.json()
            const count = data?.data ?? data ?? 0
            if (count > 0) return count
        } catch { /* 尝试下一个地址 */ }
    }
    return null
}

function animateCount(el: HTMLElement, target: number) {
    const obj = { v: 0 }
    gsap.to(obj, {
        v: target,
        duration: 1.6,
        ease: "power2.out",
        onUpdate() {
            el.textContent = Math.floor(obj.v).toLocaleString()
        },
    })
}

onMounted(() => {
    if (!root.value) return
    gsap.registerPlugin(SplitText)
    // 后台标签页/受限渲染环境下 rAF 被节流，默认 lagSmoothing 会让时间线爬行，关闭让动画按真实时间推进
    gsap.ticker.lagSmoothing(false)
    const q = gsap.utils.selector(root.value)

    // 用户数请求与入场动画并行发出，等数字行亮相时数据多半已就绪，跳动无需再等网络
    const countReady = fetchCount()

    mm = gsap.matchMedia()

    // 动画无条件执行，不读系统 prefers-reduced-motion；matchMedia 仅借用其挂载/卸载时的统一 revert
    mm.add("(min-width: 0px)", () => {
        const split = new SplitText(q(".yl-hero__title"), { type: "chars" })
        if (dust.value) spawnDust(dust.value)

        const tl = gsap.timeline({ defaults: { ease: "expo.out" } })
        tl.from(q(".yl-hero__logo"), { autoAlpha: 0, scale: 0.7, y: 24, duration: 0.7 })
            .from(split.chars, { autoAlpha: 0, y: 80, duration: 0.9, stagger: 0.06 }, "-=0.35")
            .from(q(".yl-hero__underline"), { scaleX: 0, duration: 0.7, ease: "expo.inOut", transformOrigin: "center center" }, "-=0.45")
            .from(q(".yl-hero__subtitle"), { autoAlpha: 0, y: 24, duration: 0.7 }, "-=0.35")
            .from(q(".yl-btn"), { autoAlpha: 0, y: 24, duration: 0.6, stagger: 0.08 }, "-=0.35")
            .from(q(".yl-hero__stats > *"), { autoAlpha: 0, y: 18, duration: 0.6, stagger: 0.06 }, "-=0.3")
            // 数字行开始淡入（"<" = 上一段起点）就触发跳动，不再等整条时间线（含掉落物）播完
            .call(async () => {
                const el = q("#yl-user-count")[0] as HTMLElement | undefined
                if (!el) return
                const count = await countReady
                if (count) animateCount(el, count)
                else el.textContent = "160,000+"
            }, null, "<")
            .from(q(".yl-hero__scroll"), { autoAlpha: 0, duration: 0.8 }, "-=0.2")

        // 掉落物入场：从上方砸落 → 名牌落地挤压回弹 → 光柱从底部迸发
        q(".yl-drop").forEach((el, i) => {
            const label = el.querySelector(".yl-drop__label")
            const beam = el.querySelector(".yl-drop__beam")
            const t = 0.9 + i * 0.22
            tl.from(el, { y: -70, autoAlpha: 0, duration: 0.42, ease: "power2.in" }, t)
            if (label) {
                tl.to(label, {
                    keyframes: [
                        { scaleY: 0.82, scaleX: 1.08, duration: 0.09, ease: "power2.out" },
                        { scaleY: 1, scaleX: 1, duration: 0.5, ease: "elastic.out(1, 0.45)" },
                    ],
                    transformOrigin: "bottom center",
                }, t + 0.42)
            }
            if (beam) {
                tl.fromTo(beam,
                    { autoAlpha: 0, scaleY: 0.25 },
                    { autoAlpha: 0.85, scaleY: 1, duration: 0.35, ease: "power3.out", transformOrigin: "bottom center" },
                    t + 0.42,
                )
            }
        })

        // 待机动效（漂浮 + 光柱呼吸）：等掉落入场全部落定后再启动，避免和入场争夺透明度
        tl.eventCallback("onComplete", () => {
            if (!window.matchMedia("(min-width: 960px)").matches) return
            gsap.to(q(".yl-hero__drops--left"), { y: -12, duration: 7, yoyo: true, repeat: -1, ease: "sine.inOut" })
            gsap.to(q(".yl-hero__drops--right"), { y: 10, duration: 8, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 1 })
            q(".yl-drop__beam").forEach((beam, i) => {
                gsap.to(beam, { opacity: 0.45, duration: 1.6 + i * 0.3, yoyo: true, repeat: -1, ease: "sine.inOut" })
            })
        })

        return () => split.revert()
    })
})

onBeforeUnmount(() => {
    mm?.revert()
})
</script>

<style scoped lang="scss">
.yl-hero {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 64px);
    min-height: calc(100svh - 64px);
    padding: 96px var(--yl-space-content) 88px;
    overflow: clip;
}

.yl-hero__halo {
    position: absolute;
    left: 50%;
    top: 36%;
    width: min(720px, 90vw);
    height: 440px;
    transform: translate(-50%, -50%);
    background: radial-gradient(closest-side, rgba(232, 162, 60, 0.15), transparent 70%);
    pointer-events: none;
}

.yl-hero__dust {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;

    i {
        position: absolute;
        border-radius: 50%;
        background: var(--yl-gold-bright);
        box-shadow: 0 0 6px var(--yl-gold-glow);
        opacity: 0;
    }
}

.yl-hero__drops {
    position: absolute;
    z-index: 0;
    display: flex;
    flex-direction: column;
    opacity: 0.85;
    pointer-events: none;

    @media (max-width: 959px) {
        display: none;
    }
}

.yl-hero__drops--left {
    left: 9%;
    top: 16%;
}

.yl-hero__drops--right {
    right: 9%;
    top: 26%;
    align-items: flex-end;
}

.yl-drop {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: var(--mt);
    transform: translateX(var(--dx));
}

.yl-drop__beam {
    position: relative;
    display: block;
    width: 3px;
    height: var(--bh);
    margin-bottom: 9px;
    border-radius: 2px;
    /* 炽亮核心：底部接近白的亮心，向上过渡到光色再淡出 */
    background: linear-gradient(to top, var(--beam-core) 0%, var(--beam) 32%, transparent 88%);
    box-shadow: 0 0 10px 1px var(--beam-glow), 0 0 24px 5px var(--beam-glow-soft);

    /* 宽柔光锥：向上收窄的锥形漫射光 */
    &::before {
        content: "";
        position: absolute;
        left: 50%;
        bottom: 0;
        width: 16px;
        height: 100%;
        background: linear-gradient(to top, var(--beam), transparent 78%);
        clip-path: polygon(26% 100%, 74% 100%, 60% 0%, 40% 0%);
        filter: blur(3px);
        opacity: 0.65;
        transform: translateX(-50%);
        transform-origin: bottom center;
        animation: yl-beam-breathe 2.4s var(--yl-ease-inout) infinite;
        z-index: -1;
    }

    /* 底部光斑：光柱从物品处升起的光晕 */
    &::after {
        content: "";
        position: absolute;
        bottom: -4px;
        left: 50%;
        transform: translateX(-50%);
        width: 32px;
        height: 12px;
        border-radius: 50%;
        background: radial-gradient(closest-side, var(--beam), transparent 72%);
        filter: blur(2px);
        opacity: 0.8;
        z-index: -1;
    }
}

@keyframes yl-beam-breathe {
    0%,
    100% {
        opacity: 0.5;
        transform: translateX(-50%) scaleY(1);
    }
    50% {
        opacity: 0.9;
        transform: translateX(-50%) scaleY(1.05);
    }
}

.yl-drop__label {
    font-family: var(--yl-font-display);
    font-weight: 700;
    font-size: var(--fs);
    line-height: 1;
    letter-spacing: 0.06em;
    color: var(--text);
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 2px;
    padding: 4px 8px;
    white-space: nowrap;
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.55);
}

.yl-hero__content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.yl-hero__logo {
    width: clamp(72px, 8vw, 96px);
    height: auto;
    margin-bottom: 22px;
    border-radius: 22%;
    filter: drop-shadow(0 6px 28px rgba(232, 162, 60, 0.3));
}

.yl-hero__title {
    font-family: var(--yl-font-display);
    font-weight: 900;
    font-size: clamp(56px, 10vw, 104px);
    line-height: 1.15;
    letter-spacing: 0.04em;
    color: var(--yl-text-primary);
}

.yl-hero__underline {
    width: min(340px, 58vw);
    height: 4px;
    margin-top: 14px;
    background: linear-gradient(90deg, transparent, var(--yl-gold-bright), transparent);
    border-radius: 2px;
    filter: drop-shadow(0 0 6px var(--yl-gold-glow));
}

.yl-hero__subtitle {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    margin-top: 26px;
}

.yl-hero__subtitle-main {
    font-size: clamp(17px, 2vw, 22px);
    font-weight: 600;
    letter-spacing: 0.1em;
    color: var(--yl-text-primary);
}

.yl-hero__subtitle-sub {
    font-size: clamp(13px, 1.4vw, 16px);
    letter-spacing: 0.16em;
    color: var(--yl-text-secondary);
}

.yl-hero__actions {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 16px;
    margin-top: 44px;
}

.yl-btn {
    display: inline-flex;
    align-items: center;
    padding: 13px 30px;
    border-radius: var(--yl-radius);
    font-weight: 600;
    font-size: 15px;
    letter-spacing: 0.06em;
    transition-property: transform, box-shadow, background-color, filter;
    transition-duration: 0.25s;
    transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);

    &:hover {
        transform: translateY(-2px);
    }
}

.yl-btn--primary {
    background: linear-gradient(135deg, var(--yl-gold-bright), var(--yl-gold-deep));
    color: #1b1305;
    box-shadow: 0 6px 24px rgba(232, 162, 60, 0.28);

    &:hover {
        filter: brightness(1.06);
        box-shadow: 0 10px 32px rgba(232, 162, 60, 0.4);
    }
}

.yl-btn--ghost {
    border: 1px solid var(--yl-border-strong);
    color: var(--yl-gold);

    &:hover {
        background: rgba(232, 162, 60, 0.08);
    }
}

.yl-hero__stats {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    margin-top: 48px;
    font-size: 17px;
    color: var(--yl-text-secondary);
}

.yl-hero__count strong {
    color: var(--yl-gold);
    font-family: var(--yl-font-mono);
    font-size: 1.3em;
    font-weight: 700;
    margin: 0 2px;
}

.yl-hero__versions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 22px;
}

.yl-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: var(--yl-font-mono);
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: var(--yl-gold);

    /* 状态小圆点：表意"版本在线"，与上方可点按钮明确区分 */
    &::before {
        content: "";
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--yl-gold);
        box-shadow: 0 0 8px var(--yl-gold-glow);
    }
}

.yl-hero__scroll {
    position: absolute;
    bottom: 22px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: var(--yl-font-mono);
    font-size: 12px;
    letter-spacing: 0.32em;
    color: var(--yl-text-secondary);

    i {
        display: block;
        width: 2px;
        height: 40px;
        margin-top: 8px;
        background: linear-gradient(180deg, var(--yl-gold-bright), transparent);
        box-shadow: 0 0 8px var(--yl-gold-glow);
        transform-origin: top center;
        animation: yl-scroll-pulse 1.8s var(--yl-ease-inout) infinite;
    }
}

@keyframes yl-scroll-pulse {
    0% {
        transform: scaleY(0);
        opacity: 0;
    }
    40% {
        transform: scaleY(1);
        opacity: 1;
    }
    100% {
        transform: scaleY(1);
        opacity: 0;
    }
}
</style>
