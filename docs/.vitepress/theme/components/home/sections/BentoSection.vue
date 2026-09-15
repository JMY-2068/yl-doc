<template>
    <section id="bento" ref="root" class="yl-bento">
        <!-- 区块头 -->
        <div class="yl-bento__head">
            <p class="yl-bento__kicker" data-rise>04 / BENTO</p>
            <h2 class="yl-bento__title" data-rise style="--d: 0.08s">还有更多功能...</h2>
            <p class="yl-bento__desc" data-rise style="--d: 0.14s">十二项轻量功能，覆盖编辑的每个环节。</p>
        </div>

        <!-- 不对称 bento 网格：错峰滑入进场 + hover 3D 跟手流光 -->
        <div ref="grid" class="yl-bento__grid" data-rise style="--d: 0.18s">
            <!-- 01 音效包（大格：6 位音效作者 + 音频条） -->
            <article class="yl-bento__cell is-big">
                <div class="yl-bento__inner">
                    <span class="yl-bento__num">01</span>
                    <h4 class="yl-bento__cell-title">内置多款音效包</h4>
                    <p class="yl-bento__cell-desc">特色过滤音效一键替换</p>
                    <div class="yl-bento__authors">
                        <div v-for="a in soundAuthors" :key="a.name" class="yl-bento__author">
                            <img :src="ICON_BASE + '/site/' + a.avatar" :alt="a.name" loading="lazy" @error="onAvatarError">
                            <span>{{ a.name }}</span>
                        </div>
                    </div>
                    <div class="yl-bento__bars" aria-hidden="true"><i v-for="n in 7" :key="n" :style="{ '--b': (n % 4) * 0.18 + 's' }"></i></div>
                    <span class="yl-bento__glow" aria-hidden="true"></span>
                </div>
            </article>

            <!-- 其余 11 格 -->
            <article v-for="c in cells" :key="c.num" class="yl-bento__cell" :class="c.cls">
                <div class="yl-bento__inner">
                    <span class="yl-bento__num">{{ c.num }}</span>
                    <h4 class="yl-bento__cell-title">{{ c.title }}</h4>
                    <p class="yl-bento__cell-desc">{{ c.desc }}</p>
                    <!-- 11 教程宽格：小项 -->
                    <div v-if="c.items" class="yl-bento__titems">
                        <span v-for="it in c.items" :key="it" class="yl-bento__titem">{{ it }}</span>
                    </div>
                    <span class="yl-bento__glow" aria-hidden="true"></span>
                </div>
            </article>
        </div>
    </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue"

// Bento 速览：12 项轻量功能，不对称网格
// 进场：格子按网格位置错峰滑入（左列自左、右列自右、中列自下；无 JS 时直接显示）
// hover：3D 跟手倾斜 + 流光跟随（仅 hover 设备，移动端不绑定）

const ICON_BASE = "https://edit.filtereditor.cn"

// 音效作者（取自编辑器 SoundDown + 音效包页 extra：6 位，头像走线上直链）
const soundAuthors = [
    { name: "可爱妹妹", avatar: "可爱妹妹.webp" },
    { name: "温柔姐姐", avatar: "温柔姐姐.webp" },
    { name: "小结巴", avatar: "小结巴.webp" },
    { name: "呆哈拿", avatar: "呆哈拿.png" },
    { name: "天天有一只天天", avatar: "天天有一只天天.png" },
    { name: "就叫倩儿呀", avatar: "就叫倩儿呀.webp" },
]

const failedAvatars = ref(new Set<string>())

function onAvatarError(e: Event) {
    const img = e.target as HTMLImageElement
    failedAvatars.value.add(img.alt)
    img.style.display = "none"
}

interface Cell {
    num: string
    title: string
    desc: string
    cls?: string
    items?: string[]
}

const cells: Cell[] = [
    { num: "02", title: "本地导入保存", desc: "过滤存到本地，无需重复下载" },
    { num: "03", title: "双版本音效", desc: "自定义 / 系统音效，双版本下载" },
    { num: "04", title: "双模式支持", desc: "普通 / 纯净模式，一键切换" },
    { num: "05", title: "全局样式操作", desc: "字体、颜色、光柱批量调整" },
    { num: "06", title: "色板管理", desc: "收藏配色，快速改色" },
    { num: "07", title: "双语支持", desc: "简繁体一键切换" },
    { num: "08", title: "类型组云端管理", desc: "基本类型组快速复制" },
    { num: "09", title: "快速编辑", desc: "一键屏蔽 / 静音指定规则" },
    { num: "10", title: "词缀筛选", desc: "词缀过滤快速筛选定位" },
    { num: "11", title: "全套使用教程", desc: "从入门到进阶，看会为止", cls: "is-wide", items: ["图文教程", "QQ在线答疑"] },
    { num: "12", title: "公众号教程", desc: "持续发布优质使用教程" },
]

const root = ref<HTMLElement>()
const grid = ref<HTMLElement>()

let io: IntersectionObserver | undefined
let riseFallback: ReturnType<typeof setTimeout> | undefined
let cleanupHover: (() => void) | undefined

function riseIn() {
    const el = root.value
    if (!el)
        return
    // 错峰滑入：延迟与方向按格子中心位置铺开（左 1/3 自左入、右 1/3 自右入、中部自下入）
    const gridEl = grid.value
    if (gridEl) {
        const w = gridEl.clientWidth
        gridEl.querySelectorAll<HTMLElement>(".yl-bento__cell").forEach((cell) => {
            const cx = cell.offsetLeft + cell.offsetWidth / 2
            const ratio = cx / w
            cell.style.setProperty("--sd", (0.12 + ratio * 0.9).toFixed(2) + "s")
            if (ratio < 0.34) {
                cell.style.setProperty("--dx", "-30px")
                cell.style.setProperty("--dy", "10px")
            }
            else if (ratio > 0.66) {
                cell.style.setProperty("--dx", "30px")
                cell.style.setProperty("--dy", "10px")
            }
            else {
                cell.style.setProperty("--dx", "0px")
                cell.style.setProperty("--dy", "26px")
            }
        })
    }
    el.classList.add("is-in")
}

onMounted(() => {
    const el = root.value
    if (!el)
        return
    el.classList.add("js-anim")
    io = new IntersectionObserver(
        (entries) => {
            if (entries.some(e => e.isIntersecting)) {
                // 双 rAF：先让隐藏初始态绘制一帧再触发滑入
                requestAnimationFrame(() => requestAnimationFrame(riseIn))
                io?.disconnect()
            }
        },
        { threshold: 0.2 },
    )
    io.observe(el)
    riseFallback = setTimeout(() => {
        const elm = root.value
        if (elm && !elm.classList.contains("is-in")) {
            const r = elm.getBoundingClientRect()
            if (r.top < innerHeight && r.bottom > 0) riseIn()
        }
    }, 3000)

    // 3D 跟手倾斜 + 流光（仅 hover 设备绑定；变量挂外层 cell，inner 继承引用）
    if (matchMedia("(hover: hover)").matches) {
        const gridEl = grid.value
        if (gridEl) {
            const onMove = (e: PointerEvent) => {
                const cell = (e.target as HTMLElement).closest<HTMLElement>(".yl-bento__cell")
                if (!cell)
                    return
                const r = cell.getBoundingClientRect()
                const px = (e.clientX - r.left) / r.width
                const py = (e.clientY - r.top) / r.height
                cell.style.setProperty("--ry", ((px - 0.5) * 6).toFixed(2) + "deg")
                cell.style.setProperty("--rx", ((0.5 - py) * 6).toFixed(2) + "deg")
                cell.style.setProperty("--mx", (px * 100).toFixed(1) + "%")
                cell.style.setProperty("--my", (py * 100).toFixed(1) + "%")
            }
            const onLeave = (e: PointerEvent) => {
                const cell = (e.target as HTMLElement).closest<HTMLElement>(".yl-bento__cell")
                if (cell) {
                    cell.style.removeProperty("--rx")
                    cell.style.removeProperty("--ry")
                }
            }
            gridEl.addEventListener("pointermove", onMove)
            gridEl.addEventListener("pointerout", onLeave)
            cleanupHover = () => {
                gridEl.removeEventListener("pointermove", onMove)
                gridEl.removeEventListener("pointerout", onLeave)
            }
        }
    }
})

onBeforeUnmount(() => {
    io?.disconnect()
    if (riseFallback) clearTimeout(riseFallback)
    cleanupHover?.()
})
</script>

<style scoped lang="scss">
.yl-bento {
    width: min(var(--yl-container), 100%);
    margin-inline: auto;
    box-sizing: border-box;
    padding-inline: var(--yl-space-content);
    margin-top: clamp(64px, 9vh, 120px);
    padding-top: clamp(48px, 7vh, 88px);
    border-top: 1px dashed var(--yl-border);
}

/* —— 区块头进场（通用 data-rise） —— */
.yl-bento.js-anim [data-rise] {
    opacity: 0;
    transform: translateY(24px);
}

.yl-bento.js-anim.is-in [data-rise] {
    opacity: 1;
    transform: none;
    transition-property: opacity, transform;
    transition-duration: 0.65s;
    transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
    transition-delay: var(--d, 0s);
}

.yl-bento__head {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-bottom: clamp(32px, 5vh, 52px);
}

.yl-bento__kicker {
    font-family: var(--yl-font-mono);
    font-size: 13px;
    letter-spacing: 0.22em;
    color: var(--yl-gold);
}

.yl-bento__title {
    font-family: var(--yl-font-display);
    font-weight: 900;
    font-size: clamp(28px, 4vw, 44px);
    color: var(--yl-text-primary);
}

.yl-bento__desc {
    font-size: 15px;
    color: var(--yl-text-secondary);
}

/* —— 网格：12 列不对称（大格 4×2 / 宽格 8 / 普通格 4） —— */
.yl-bento__grid {
    position: relative;
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    grid-auto-rows: minmax(148px, auto);
    grid-auto-flow: dense;
    gap: 12px;
}

.yl-bento__cell {
    position: relative;
    grid-column: span 4;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--yl-border-plain);
    border-radius: var(--yl-radius-lg);
    background: var(--yl-bg-elevated);
    box-shadow: 0 0 24px rgba(0, 0, 0, 0.25);
    overflow: hidden;

    &:hover {
        border-color: var(--yl-border-strong);
        z-index: 1;
    }

    &.is-big {
        grid-column: span 4;
        grid-row: span 2;
        background: linear-gradient(160deg, rgba(232, 162, 60, 0.09), transparent 45%), var(--yl-bg-elevated);
    }

    &.is-wide {
        grid-column: span 8;
    }
}

/* 内层：hover 3D 倾斜 + 流光（与外层进场 transform 分离，互不干扰） */
.yl-bento__inner {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 7px;
    padding: 16px 18px;
    min-height: 0;
    flex: 1;
    transform: perspective(700px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
    transition: transform 0.15s ease-out;
}

/* —— 进场：错峰滑入（方向/延迟按格子位置，无 JS 直接显示） —— */
.yl-bento.js-anim .yl-bento__cell {
    opacity: 0;
    transform: translate(var(--dx, 0px), var(--dy, 22px));
}

.yl-bento.js-anim.is-in .yl-bento__cell {
    opacity: 1;
    transform: none;
    transition-property: opacity, transform;
    transition-duration: 0.6s;
    transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
    transition-delay: var(--sd, 0.2s);
}

.yl-bento__num {
    font-family: var(--yl-font-mono);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: var(--yl-gold);
}

.yl-bento__cell-title {
    font-size: 16px;
    font-weight: 800;
    color: var(--yl-text-primary);
}

.yl-bento__cell-desc {
    font-size: 12.5px;
    line-height: 1.65;
    color: var(--yl-text-secondary);
}

/* 大格：音效作者（头像 + 名字，3×2） */
.yl-bento__authors {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px 6px;
    margin-top: auto;
    padding-top: 8px;
}

.yl-bento__author {
    display: flex;
    align-items: center;
    gap: 7px;
    min-width: 0;

    img {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        object-fit: cover;
        flex-shrink: 0;
        border: 1px solid var(--yl-border-strong);
    }

    span {
        font-size: 12px;
        font-weight: 700;
        color: var(--yl-text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}

/* 大格音效条：循环跳动（压矮给作者行让位） */
.yl-bento__bars {
    display: flex;
    align-items: flex-end;
    gap: 5px;
    height: 24px;
    padding-top: 10px;

    i {
        flex: 1;
        min-width: 4px;
        border-radius: 2px;
        background: linear-gradient(180deg, var(--yl-gold-bright), var(--yl-gold-deep));
        opacity: 0.85;
        animation: yl-bento-bar 1.1s ease-in-out infinite alternate;
        animation-delay: var(--b, 0s);
    }
}

@keyframes yl-bento-bar {
    from {
        height: 18%;
    }

    to {
        height: 100%;
    }
}

/* 宽格教程三小项 */
.yl-bento__titems {
    display: flex;
    gap: 8px;
    margin-top: auto;
    padding-top: 10px;
}

.yl-bento__titem {
    font-size: 12px;
    color: var(--yl-gold-bright);
    border: 1px solid var(--yl-border-strong);
    background: rgba(232, 162, 60, 0.07);
    border-radius: 999px;
    padding: 3px 12px;
    white-space: nowrap;
}

/* —— hover 流光层：光斑跟随光标 —— */
.yl-bento__glow {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0;
    background: radial-gradient(220px circle at var(--mx, 50%) var(--my, 50%), rgba(232, 162, 60, 0.14), transparent 65%);
    transition: opacity 0.25s ease;
}

.yl-bento__cell:hover .yl-bento__glow {
    opacity: 1;
}

/* —— 移动端：2 列堆叠（大格/宽格通栏），无 3D hover —— */
@media (max-width: 959px) {
    .yl-bento__grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        grid-auto-rows: auto;
    }

    .yl-bento__cell {
        grid-column: span 1;
        min-height: 118px;
    }

    .yl-bento__cell.is-big,
    .yl-bento__cell.is-wide {
        grid-column: span 2;
        grid-row: auto;
    }

    .yl-bento__cell-desc {
        font-size: 12px;
    }
}
</style>
