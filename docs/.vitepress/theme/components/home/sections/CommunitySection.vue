<template>
    <section id="community" ref="root" class="yl-comm">
        <!-- 区块头 -->
        <div class="yl-comm__head">
            <p class="yl-comm__kicker" data-rise>06 / COMMUNITY</p>
            <h2 class="yl-comm__title" data-rise style="--d: 0.08s">加入一乐社区</h2>
            <p class="yl-comm__desc" data-rise style="--d: 0.14s">加群交流 · 专属定制 · 公众号教程，过滤路上的问题都有人管</p>
        </div>

        <!-- 三卡：QQ 交流群 / 定制服务 / 微信公众号 -->
        <div class="yl-comm__cards">
            <!-- QQ 交流群 -->
            <article class="yl-comm__card" data-rise style="--d: 0.2s">
                <div class="yl-comm__card-head">
                    <span class="yl-comm__icon" aria-hidden="true">
                        <svg viewBox="0 0 26 26"><rect x="1" y="2" width="24" height="18" rx="6" fill="none" stroke="currentColor" stroke-width="2" /><path d="M 9 20 L 9 25 L 14 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" /></svg>
                    </span>
                    <h4 class="yl-comm__card-title">QQ 交流群</h4>
                    <span class="yl-comm__chip">共 5 个群</span>
                </div>
                <ul class="yl-comm__groups">
                    <li v-for="g in qqGroups" :key="g.id">
                        <a :href="g.link" target="_blank" rel="noopener" class="yl-comm__group" :class="{ 'is-full': g.full }">
                            <span class="yl-comm__group-num">{{ g.id }}</span>
                            <span class="yl-comm__group-tag" :class="g.full ? 'is-full' : ''">{{ g.tag }}</span>
                            <span class="yl-comm__group-cta">点我加群</span>
                            <span class="yl-comm__group-arrow" aria-hidden="true">→</span>
                        </a>
                    </li>
                </ul>
            </article>

            <!-- 定制服务 -->
            <article class="yl-comm__card" data-rise style="--d: 0.26s">
                <div class="yl-comm__card-head">
                    <span class="yl-comm__icon" aria-hidden="true">
                        <svg viewBox="0 0 26 26"><path d="M 2 8 L 8 15 L 13 5 L 18 15 L 24 8 L 22 21 L 4 21 Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" /></svg>
                    </span>
                    <h4 class="yl-comm__card-title">定制服务</h4>
                </div>
                <p class="yl-comm__copy">不满足过滤需求？</p>
                <p class="yl-comm__copy">或懒得自己修改？</p>
                <p class="yl-comm__copy">提供专属定制服务</p>
                <a :href="DZ_QR" target="_blank" rel="noopener" class="yl-comm__qr">
                    <img :src="DZ_QR" alt="定制专员二维码" loading="lazy" @error="onImgError">
                    <span class="yl-comm__qr-cap">扫码联系定制专员</span>
                </a>
            </article>

            <!-- 微信公众号 -->
            <article class="yl-comm__card" data-rise style="--d: 0.32s">
                <div class="yl-comm__card-head">
                    <span class="yl-comm__icon" aria-hidden="true">
                        <svg viewBox="0 0 26 26"><rect x="2" y="2" width="22" height="22" rx="6" fill="none" stroke="currentColor" stroke-width="2" /><circle cx="8.5" cy="10.5" r="1.6" fill="currentColor" /><circle cx="13" cy="10.5" r="1.6" fill="currentColor" /><circle cx="17.5" cy="10.5" r="1.6" fill="currentColor" /><path d="M 8.5 16 Q 13 19 17.5 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
                    </span>
                    <h4 class="yl-comm__card-title">微信公众号</h4>
                </div>
                <p class="yl-comm__copy">过滤技巧持续更新</p>
                <p class="yl-comm__copy">40+ 篇教程已输出</p>
                <a :href="GZH_QR" target="_blank" rel="noopener" class="yl-comm__qr">
                    <img :src="GZH_QR" alt="微信公众号二维码" loading="lazy" @error="onImgError">
                    <span class="yl-comm__qr-cap">扫码关注公众号</span>
                </a>
            </article>
        </div>

        <!-- 社交阵地一行（链接取自站点社交配置） -->
        <div class="yl-comm__social" data-rise style="--d: 0.4s">
            <template v-for="(s, i) in socials" :key="s.label">
                <a :href="s.link" target="_blank" rel="noopener">{{ s.label }}</a>
                <i v-if="i < socials.length - 1" aria-hidden="true">·</i>
            </template>
        </div>
    </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue"

// 社区生态带（方案 C 三卡）：QQ 交流群 / 定制服务 / 微信公众号 + 社交阵地行
// 素材全部线上直链（不进仓库）：QQ 群二维码 COS、定制/公众号取自编辑器 site 目录
// 群号与加群链接来自旧首页；文案为占位，待用户定稿

const DZ_QR = "https://edit.filtereditor.cn/site/%E5%AE%9A%E5%88%B6.png"
const GZH_QR = "https://edit.filtereditor.cn/site/%E5%85%AC%E4%BC%97%E5%8F%B7.jpg"

// full 为独立的降透明度标记，与 tag 文案解耦
const qqGroups = [
    { id: "663896689", tag: "活跃聊天 已满", full: true, link: "https://qm.qq.com/q/r5NmIj4XTM" },
    { id: "225616278", tag: "潜水下载", full: false, link: "https://qm.qq.com/q/utSaj5dfNu" },
    { id: "621055124", tag: "潜水下载", full: false, link: "https://qm.qq.com/q/wT190TKwJq" },
    { id: "495451331", tag: "活跃聊天 已满", full: true, link: "https://qm.qq.com/q/KAsjF2w0A8" },
    { id: "476921399", tag: "潜水下载", full: false, link: "https://qm.qq.com/q/mrL90bDCLe" },
]

const socials = [
    { label: "踩蘑菇论坛", link: "https://www.caimogu.cc/user/1083041.html" },
    { label: "抖音", link: "https://v.douyin.com/MFb7gqSe648/" },
    { label: "B 站空间", link: "https://space.bilibili.com/20940843" },
    { label: "GitHub", link: "https://github.com/JMY-2068" },
]

function onImgError(e: Event) {
    const img = e.target as HTMLImageElement
    img.style.display = "none"
}

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
.yl-comm {
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
.yl-comm.js-anim [data-rise] {
    opacity: 0;
    transform: translateY(24px);
}

.yl-comm.js-anim.is-in [data-rise] {
    opacity: 1;
    transform: none;
    /* 注意：构建管线会吃掉 transition 简写里的 var()，必须拆成 longhand */
    transition-property: opacity, transform;
    transition-duration: 0.65s;
    transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
    transition-delay: var(--d, 0s);
}

/* —— 区块头 —— */
.yl-comm__head {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    text-align: center;
    margin-bottom: clamp(32px, 5vh, 52px);
}

.yl-comm__kicker {
    font-family: var(--yl-font-mono);
    font-size: 13px;
    letter-spacing: 0.22em;
    color: var(--yl-gold);
}

.yl-comm__title {
    font-family: var(--yl-font-display);
    font-weight: 900;
    font-size: clamp(28px, 4vw, 44px);
    color: var(--yl-text-primary);
}

.yl-comm__desc {
    max-width: 620px;
    line-height: 1.8;
    color: var(--yl-text-secondary);
}

/* —— 三卡 —— */
.yl-comm__cards {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 24px;
    align-items: stretch;
}

.yl-comm__card {
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 1px solid var(--yl-border-plain);
    border-radius: var(--yl-radius-lg);
    background: var(--yl-bg-elevated);
    padding: 22px 22px 24px;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;

    &:hover {
        border-color: var(--yl-border-strong);
        box-shadow: 0 0 32px rgba(232, 162, 60, 0.1);
    }
}

.yl-comm__card-head {
    display: flex;
    align-items: center;
    gap: 9px;
    width: 100%;
}

.yl-comm__icon {
    display: inline-flex;
    color: var(--yl-gold);

    svg {
        width: 22px;
        height: 22px;
        display: block;
    }
}

.yl-comm__card-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--yl-text-primary);
}

.yl-comm__chip {
    margin-left: auto;
    font-family: var(--yl-font-mono);
    font-size: 10px;
    color: var(--yl-gold-bright);
    border: 1px solid var(--yl-border-strong);
    border-radius: 999px;
    padding: 2px 8px;
    white-space: nowrap;
}

/* QQ 群号列表（行可点，直跳加群页） */
.yl-comm__groups {
    width: 100%;
    list-style: none;
    margin: 14px 0 4px;
    padding: 0;
    display: flex;
    flex-direction: column;
}

.yl-comm__group {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 8px;
    border-radius: var(--yl-radius-sm);
    text-decoration: none;
    transition: background-color 0.2s ease;

    &:hover {
        background: rgba(232, 162, 60, 0.07);
    }

    &.is-full {
        opacity: 0.55;
    }
}

.yl-comm__group-num {
    font-family: var(--yl-font-mono);
    font-size: 13px;
    font-weight: 700;
    color: var(--yl-gold-bright);
    letter-spacing: 0.04em;
}

.yl-comm__group-tag {
    font-size: 10px;
    border-radius: 999px;
    padding: 1px 7px;
    color: var(--yl-text-secondary);
    border: 1px solid var(--yl-border-plain);

    &.is-full {
        color: var(--yl-text-faint);
    }
}

.yl-comm__group-cta {
    margin-left: auto;
    font-size: 12px;
    font-weight: 700;
    color: var(--yl-text-primary);
    transition: color 0.2s ease;
}

.yl-comm__group-arrow {
    font-size: 12px;
    color: var(--yl-text-faint);
    transition: color 0.2s ease, transform 0.2s ease;
}

.yl-comm__group:hover .yl-comm__group-cta,
.yl-comm__group:hover .yl-comm__group-arrow {
    color: var(--yl-gold);
}

.yl-comm__group:hover .yl-comm__group-arrow {
    transform: translateX(2px);
}

/* 文案行（定制/公众号卡） */
.yl-comm__copy {
    margin: 4px 0 0;
    width: 100%;
    font-size: 13px;
    line-height: 1.9;
    color: var(--yl-text-secondary);
}

.yl-comm__card .yl-comm__copy:first-of-type {
    margin-top: 14px;
}

/* 二维码（可点开原图，移动端长按识别） */
.yl-comm__qr {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 9px;
    margin-top: auto; /* 沉到卡片底部 */
    padding-top: 18px; /* 与上方文案的最小间距兜底（auto 被压没时不贴字） */
    text-decoration: none;

    img {
        width: 120px;
        height: 120px;
        object-fit: contain;
        border-radius: var(--yl-radius);
        background: #ece8df;
        padding: 4px;
        box-sizing: border-box;
        transition: transform 0.25s ease;
    }

    &:hover img {
        transform: scale(1.04);
    }
}

.yl-comm__qr-cap {
    font-size: 11px;
    color: var(--yl-text-faint);
}

/* —— 社交阵地行 —— */
.yl-comm__social {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 14px;
    margin-top: clamp(28px, 4vh, 40px);

    a {
        font-size: 12px;
        color: var(--yl-text-faint);
        text-decoration: none;
        transition: color 0.2s ease;

        &:hover {
            color: var(--yl-gold-bright);
        }
    }

    i {
        font-style: normal;
        color: var(--yl-border-strong);
        font-size: 12px;
    }
}

/* —— 移动端：三卡单列堆叠 —— */
@media (max-width: 959px) {
    .yl-comm__cards {
        grid-template-columns: 1fr;
        gap: 16px;
    }

    .yl-comm__card {
        padding: 18px 18px 20px;
    }
}
</style>
