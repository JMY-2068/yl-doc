<template>
    <section
        id="signature"
        ref="root"
        class="yl-sig"
        :class="{ 'yl-sig--scroll': mode === 'scroll' }"
    >
        <div class="yl-sig__sticky">
            <div class="yl-sig__head">
                <p class="yl-sig__kicker">BEFORE / AFTER</p>
                <h2 class="yl-sig__title">同样的掉落，不同的世界</h2>
                <p class="yl-sig__desc">
                    {{ mode === "scroll" ? "继续滚动，让过滤器扫过战场" : "拖动分割线，看看过滤器做了什么 —— 垃圾原地消失，值钱的在原地亮起" }}
                </p>
                <Transition name="yl-sig-fade" mode="out-in">
                    <p v-if="mode === 'scroll'" :key="phase" class="yl-sig__phase">{{ phases[phase] }}</p>
                </Transition>
            </div>

            <div
                ref="stage"
                class="yl-sig__stage"
                :style="{ '--pos': pos + '%' }"
                @pointerdown="onPointerDown"
                @pointermove="onPointerMove"
                @pointerup="endDrag"
                @pointercancel="endDrag"
            >
                <!-- 底层：无过滤 —— 全部物品统一默认样式（土黄灰字 + 暗底）；滚动模式下被扫过的逐个坠落 -->
                <div class="yl-sig__layer">
                    <span
                        v-for="(it, i) in items"
                        :key="'b' + i"
                        class="yl-sig__plate"
                        :class="{ 'yl-sig__plate--passed': mode === 'scroll' && passed(it) }"
                        :style="{ left: it.x + '%', top: it.y + '%', '--tilt': (i % 2 === 0 ? 3 : -4) + 'deg' }"
                    >{{ it.name }}</span>
                </div>

                <!-- 上层：已过滤 —— 隐藏垃圾，其余原位置换过滤样式；滚动模式下被扫过的依次点亮 -->
                <div class="yl-sig__layer yl-sig__layer--after">
                    <span
                        v-for="(it, i) in valuables"
                        :key="'a' + i"
                        class="yl-sig__drop"
                        :class="{ 'yl-sig__drop--on': mode === 'slider' || passed(it) }"
                        :style="{ left: it.x + '%', top: it.y + '%' }"
                    >
                        <i v-if="it.val?.beam" class="yl-sig__beam" :style="beamStyle(it)"></i>
                        <em class="yl-sig__plate--styled" :style="plateStyle(it)">
                            <img
                                v-if="it.val?.icon"
                                class="yl-sig__icon"
                                :src="iconUrl(it)"
                                :style="{ width: iconSize(it) + 'px' }"
                                alt=""
                                @error="(e: Event) => (e.target as HTMLImageElement).style.display = 'none'"
                            />
                            {{ it.name }}
                        </em>
                    </span>
                </div>

                <!-- 滑杆模式：可拖动分割线 -->
                <div v-if="mode === 'slider'" class="yl-sig__divider" aria-hidden="true">
                    <div class="yl-sig__handle">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5"/></svg>
                    </div>
                </div>

                <!-- 滚动模式：过滤扫描线（带 Show 标记） -->
                <div v-if="mode === 'scroll'" class="yl-sig__scan" :style="{ left: sweep + '%' }" aria-hidden="true">
                    <span class="yl-sig__scan-tag">Show</span>
                </div>

                <template v-if="mode === 'slider'">
                    <span class="yl-sig__tag yl-sig__tag--after">一乐过滤后</span>
                    <span class="yl-sig__tag yl-sig__tag--before">无过滤</span>
                </template>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// 场景物品：用户提供的真实过滤样本（21 个；无 val = 过滤后隐藏；样式/字号/光柱/图标均取自真实规则，字号 ×0.32 缩放）
interface SigItem {
    name: string
    x: number
    y: number
    val?: {
        text: string
        bg: string
        border: string
        fs?: number
        beam?: string
        icon?: string
        iconSize?: 0 | 1 | 2
    }
}

const items: SigItem[] = [
    { name: "粗制弓", x: 12, y: 19 },
    { name: "毁灭者之弓", x: 52, y: 22, val: { text: "rgb(255, 255, 0)", bg: "rgb(75, 75, 0)", border: "rgb(220, 220, 0)", fs: 12 } },
    { name: "锈蚀胸甲", x: 80, y: 18 },
    { name: "邪恶束衣", x: 32, y: 28, val: { text: "rgb(136, 136, 255)", bg: "rgb(0, 0, 75)", border: "rgb(100, 100, 255)", fs: 12 } },
    { name: "重革腰带", x: 68, y: 31, val: { text: "rgb(180, 96, 0)", bg: "#ffffff", border: "rgb(255, 0, 0)", fs: 15, beam: "#ff2800", icon: "UpsideDownHouseRed", iconSize: 1 } },
    { name: "金光戒指", x: 8, y: 37, val: { text: "rgb(180, 96, 0)", bg: "rgb(0, 0, 0)", border: "rgb(255, 0, 0)", fs: 13, icon: "UpsideDownHouseBrown", iconSize: 2 } },
    { name: "先祖冠冕", x: 42, y: 40, val: { text: "rgb(237, 235, 235)", bg: "rgba(68, 73, 92, 0.8)", border: "rgb(255, 225, 0)", fs: 15, icon: "UpsideDownHouseWhite", iconSize: 1 } },
    { name: "卡兰德的魔镜", x: 82, y: 43, val: { text: "#ffffff", bg: "rgba(255, 40, 0, 0.9)", border: "transparent", fs: 15, beam: "#ff2800", icon: "StarRed", iconSize: 0 } },
    { name: "神圣石", x: 20, y: 49, val: { text: "#ff0000", bg: "#ffffff", border: "#ff0000", fs: 15, beam: "#ff2800", icon: "CircleRed", iconSize: 0 } },
    { name: "混沌石", x: 58, y: 52, val: { text: "rgb(217, 102, 111)", bg: "#ffffff", border: "rgb(217, 102, 111)", fs: 13, beam: "#d9666f", icon: "CirclePink", iconSize: 1 } },
    { name: "贪婪战书", x: 5, y: 55, val: { text: "rgb(44, 218, 152)", bg: "rgb(11, 57, 39)", border: "rgb(44, 218, 152)", fs: 12 } },
    { name: "崇高石", x: 86, y: 60, val: { text: "#000000", bg: "rgb(247, 156, 110)", border: "#000000", fs: 12, icon: "CircleOrange", iconSize: 2 } },
    { name: "高级工匠石", x: 36, y: 61, val: { text: "#000000", bg: "rgb(240, 180, 100)", border: "#000000", fs: 12, icon: "CircleWhite", iconSize: 2 } },
    { name: "富豪石", x: 10, y: 67, val: { text: "rgb(255, 0, 255)", bg: "rgb(0, 0, 0)", border: "rgb(255, 0, 255)", fs: 12 } },
    { name: "蜕变石碎片", x: 72, y: 70 },
    { name: "引路石（16 阶）", x: 26, y: 75, val: { text: "#000000", bg: "#ffffff", border: "#000000", fs: 13, icon: "HexagonPink", iconSize: 2 } },
    { name: "未切割的技能宝石（等级 20）", x: 50, y: 76, val: { text: "#ff0000", bg: "#ffffff", border: "#ff0000", fs: 15, beam: "#ff2800", icon: "KiteRed", iconSize: 0 } },
    { name: "红玉", x: 80, y: 78, val: { text: "rgb(255, 255, 119)", bg: "rgb(67, 67, 33)", border: "rgb(74, 230, 58)", fs: 13 } },
    { name: "梦魇拟像裂片", x: 85, y: 34, val: { text: "rgb(226, 248, 239)", bg: "rgb(38, 42, 41)", border: "rgb(226, 248, 239)", fs: 12, icon: "SquareWhite", iconSize: 2 } },
    { name: "先祖密藏日志", x: 65, y: 16, val: { text: "rgb(43, 75, 220)", bg: "#ffffff", border: "rgb(43, 75, 220)", fs: 15, icon: "HexagonPink", iconSize: 1 } },
    { name: "万用腰带", x: 38, y: 14, val: { text: "#ffffff", bg: "rgb(213, 131, 131)", border: "rgb(255, 0, 0)", fs: 15, icon: "UpsideDownHouseRed", iconSize: 1 } },
]

const valuables = computed(() => items.filter(it => it.val))

function iconUrl(it: SigItem) {
    return `https://edit.filtereditor.cn/images/drop/icon_${it.val!.icon}.png`
}

function iconSize(it: SigItem) {
    return it.val!.iconSize === 0 ? 18 : it.val!.iconSize === 1 ? 14 : 11
}

function plateStyle(it: SigItem) {
    return {
        "--text": it.val!.text,
        "--bg": it.val!.bg,
        "--border": it.val!.border,
        "--fs": `${it.val!.fs ?? 12}px`,
    }
}

function beamStyle(it: SigItem) {
    const beam = it.val!.beam!
    return {
        background: `linear-gradient(to top, ${beam}, transparent 85%)`,
        boxShadow: `0 0 12px 3px ${beam}55`,
    }
}

// ============ 模式与驱动 ============
// slider：移动端 / 减少动效 —— 拖动分割线对比
// scroll：桌面 —— 滚动驱动扫描线，垃圾逐个坠落、值钱的原地点亮
const root = ref<HTMLElement>()
const stage = ref<HTMLElement>()
const mode = ref<"slider" | "scroll">("slider")
const pos = ref(50) // 滑杆分割线位置
const sweep = ref(0) // 滚动扫描线位置（0~108，略超 100 保证末尾物品扫完）

let mm: gsap.MatchMedia | undefined

// 估算名牌宽度（%），用于判断是否已被扫描线扫过
const STAGE_W = 1080
function widthPct(it: SigItem) {
    const fs = it.val?.fs ?? 12
    const px = it.name.length * fs * 1.06 + 30 + (it.val?.icon ? 20 : 0)
    return px / STAGE_W * 100
}

function passed(it: SigItem) {
    return sweep.value >= it.x + widthPct(it) - 1
}

const phases = ["满屏掉落，看不过来？", "过滤器扫过 —— 垃圾隐去", "值钱的，原地亮起"]
const phase = computed(() => (sweep.value < 38 ? 0 : sweep.value < 76 ? 1 : 2))

onMounted(() => {
    if (!root.value) return
    gsap.registerPlugin(ScrollTrigger)
    gsap.ticker.lagSmoothing(false)

    mm = gsap.matchMedia()
    mm.add("(min-width: 960px) and (prefers-reduced-motion: no-preference)", () => {
        mode.value = "scroll"

        // 320vh 高度由 mode class 驱动，须等 DOM 更新后再创建 ScrollTrigger，否则进度区间按矮尺寸计算
        let st: ScrollTrigger | undefined
        let disposed = false
        nextTick(() => {
            if (disposed || !root.value) return
            st = ScrollTrigger.create({
                trigger: root.value,
                start: "top 64px",
                end: "bottom bottom",
                onUpdate: (self) => {
                    sweep.value = self.progress * 108
                },
            })
            ScrollTrigger.refresh()
            sweep.value = st.progress * 108
        })

        return () => {
            disposed = true
            st?.kill()
            mode.value = "slider"
            sweep.value = 0
        }
    })
})

onBeforeUnmount(() => {
    mm?.revert()
})

// ============ 滑杆拖动 ============
let dragging = false

function setPosFromEvent(e: PointerEvent) {
    if (!stage.value) return
    const rect = stage.value.getBoundingClientRect()
    const pct = ((e.clientX - rect.left) / rect.width) * 100
    pos.value = Math.min(99, Math.max(1, pct))
}

function onPointerDown(e: PointerEvent) {
    if (mode.value === "scroll") return
    dragging = true
    setPosFromEvent(e)
    try {
        stage.value?.setPointerCapture(e.pointerId)
    } catch {
        // 合成指针事件不支持 capture，不影响拖拽本身
    }
}

function onPointerMove(e: PointerEvent) {
    if (dragging) setPosFromEvent(e)
}

function endDrag() {
    dragging = false
}
</script>

<style scoped lang="scss">
.yl-sig {
    padding: var(--yl-space-section) var(--yl-space-content);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 40px;
}

.yl-sig__sticky {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 40px;
    width: 100%;
}

/* —— 滚动叙事模式：长滚动段 + 舞台钉在视口中央 —— */
.yl-sig--scroll {
    height: 320vh;
    padding: 0;

    .yl-sig__sticky {
        position: sticky;
        top: 64px;
        height: calc(100vh - 64px);
        justify-content: center;
        padding: 0 var(--yl-space-content);
    }

    /* 滚动模式不做整层裁切，由每个名牌自己的过渡驱动 */
    .yl-sig__layer,
    .yl-sig__layer--after {
        clip-path: none;
    }
}

.yl-sig__head {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    text-align: center;
}

.yl-sig__kicker {
    font-family: var(--yl-font-mono);
    font-size: 13px;
    letter-spacing: 0.22em;
    color: var(--yl-gold);
}

.yl-sig__title {
    font-family: var(--yl-font-display);
    font-weight: 900;
    font-size: clamp(26px, 3.6vw, 40px);
    color: var(--yl-text-primary);
}

.yl-sig__desc {
    max-width: 560px;
    line-height: 1.8;
    color: var(--yl-text-secondary);
}

.yl-sig__phase {
    font-size: clamp(15px, 1.8vw, 19px);
    font-weight: 600;
    letter-spacing: 0.08em;
    color: var(--yl-gold);
    min-height: 1.6em;
}

.yl-sig-fade-enter-active,
.yl-sig-fade-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.yl-sig-fade-enter-from {
    opacity: 0;
    transform: translateY(8px);
}

.yl-sig-fade-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}

.yl-sig__stage {
    position: relative;
    width: min(1080px, 100%);
    height: clamp(460px, 68vh, 660px);
    border: 1px solid var(--yl-border);
    border-radius: var(--yl-radius-lg);
    background:
        radial-gradient(900px 400px at 50% 110%, rgba(232, 162, 60, 0.06), transparent 70%),
        var(--yl-bg-elevated);
    overflow: hidden;
    cursor: ew-resize;
    touch-action: none;
    user-select: none;
}

.yl-sig--scroll .yl-sig__stage {
    cursor: default;
    touch-action: auto;
}

.yl-sig__layer {
    position: absolute;
    inset: 0;
    /* 滑杆模式：底层只显示分割线右侧（无过滤世界） */
    clip-path: inset(0 0 0 var(--pos));
}

/* 底层名牌（无过滤态）：取自真实默认样式 SetTextColor 150 141 121 / SetBackgroundColor 13 12 10 */
.yl-sig__plate {
    position: absolute;
    font-family: var(--yl-font-display);
    font-size: 12px;
    line-height: 1;
    letter-spacing: 0.05em;
    color: rgb(150, 141, 121);
    background: rgb(13, 12, 10);
    border: 1px solid transparent;
    border-radius: 2px;
    padding: 3px 6px;
    white-space: nowrap;
}

/* 滚动模式：被扫描线扫过的灰字名牌坠落消失 */
.yl-sig--scroll .yl-sig__plate {
    transition: opacity 0.4s ease, transform 0.55s cubic-bezier(0.55, 0, 0.8, 0.4);
}

.yl-sig--scroll .yl-sig__plate--passed {
    opacity: 0;
    transform: translateY(46px) rotate(var(--tilt, 3deg)) scale(0.96);
}

/* 上层：滑杆模式下只显示分割线左侧（向右拖=过滤逐渐生效） */
.yl-sig__layer--after {
    clip-path: inset(0 calc(100% - var(--pos)) 0 0);
}

.yl-sig__drop {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
}

/* 滚动模式：值钱名牌原地点亮（缩放浮现 + 光柱升起） */
.yl-sig--scroll .yl-sig__drop {
    opacity: 0;
    transform: translateY(14px) scale(0.85);
    transition: opacity 0.45s ease, transform 0.5s var(--yl-ease-out);
}

.yl-sig--scroll .yl-sig__drop--on {
    opacity: 1;
    transform: none;
}

.yl-sig__beam {
    display: block;
    width: 3px;
    height: 52px;
    margin-bottom: 6px;
    border-radius: 2px;
}

.yl-sig--scroll .yl-sig__beam {
    transform: scaleY(0);
    transform-origin: bottom center;
    transition: transform 0.5s var(--yl-ease-out) 0.1s;
}

.yl-sig--scroll .yl-sig__drop--on .yl-sig__beam {
    transform: scaleY(1);
}

.yl-sig__plate--styled {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-style: normal;
    font-size: var(--fs);
    font-weight: 700;
    letter-spacing: 0.05em;
    line-height: 1;
    color: var(--text);
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 2px;
    padding: 4px 9px;
    white-space: nowrap;
    box-shadow: 0 3px 14px rgba(0, 0, 0, 0.55);
}

.yl-sig__icon {
    display: block;
    height: auto;
    image-rendering: pixelated;
}

/* 滑杆分割线 */
.yl-sig__divider {
    position: absolute;
    top: 0;
    bottom: 0;
    left: var(--pos);
    width: 2px;
    transform: translateX(-1px);
    background: linear-gradient(180deg, transparent, var(--yl-gold) 12%, var(--yl-gold) 88%, transparent);
    box-shadow: 0 0 12px var(--yl-gold-glow);
    pointer-events: none;
}

.yl-sig__handle {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #1b1305;
    background: linear-gradient(135deg, var(--yl-gold-bright), var(--yl-gold-deep));
    box-shadow: 0 2px 14px rgba(232, 162, 60, 0.45);
}

/* 滚动模式：过滤扫描线 */
.yl-sig__scan {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
    transform: translateX(-1px);
    background: linear-gradient(180deg, transparent, var(--yl-gold) 8%, var(--yl-gold) 92%, transparent);
    box-shadow: 0 0 16px var(--yl-gold-glow);
    pointer-events: none;
}

.yl-sig__scan-tag {
    position: absolute;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    font-family: var(--yl-font-mono);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.14em;
    color: #1b1305;
    background: linear-gradient(135deg, var(--yl-gold-bright), var(--yl-gold-deep));
    border-radius: var(--yl-radius-sm);
    padding: 3px 8px;
}

/* 左右角标签（滑杆模式） */
.yl-sig__tag {
    position: absolute;
    top: 14px;
    font-family: var(--yl-font-mono);
    font-size: 12px;
    letter-spacing: 0.14em;
    padding: 4px 12px;
    border-radius: var(--yl-radius-sm);
    background: rgba(11, 11, 15, 0.7);
    pointer-events: none;
}

.yl-sig__tag--before {
    right: 14px;
    color: var(--yl-text-secondary);
    border: 1px solid var(--yl-border-plain);
}

.yl-sig__tag--after {
    left: 14px;
    color: var(--yl-gold);
    border: 1px solid var(--yl-border-strong);
}
</style>
