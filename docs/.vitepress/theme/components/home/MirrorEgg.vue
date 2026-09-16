<template>
    <!-- 抓魔镜彩蛋：魔镜在可视区随机闪现，每 2 秒换位；点中弹祝福 -->
    <div
        v-if="active"
        class="yl-mirror"
        :class="{ 'is-in': visible }"
        :style="{ left: `${x}px`, top: `${y}px` }"
        @click="catchMirror"
    >
        <span class="yl-mirror__glow" aria-hidden="true" />
        <img :src="MIRROR_SRC" alt="卡兰德的魔镜" draggable="false" @error="onError">
    </div>

    <!-- 祝福提示（游戏名牌风） -->
    <Transition name="yl-mirror-pop">
        <div v-if="toast" class="yl-mirror__toast" role="status">
            <img :src="MIRROR_SRC" alt="" draggable="false">
            <p>哈哈哈，被你抓到了，<em>今天一定出镜子！！！</em></p>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue"

// 抓魔镜彩蛋（桌面鼠标设备）：魔镜随机出现在可视区（避开顶栏/传送轨/回顶），
// 每 2 秒换位（淡出→闪现→弹入）；点中弹祝福，10 秒后重生可再玩；图标加载失败则整个静默关闭

const MIRROR_SRC = "https://edit.filtereditor.cn/images/base/poe2/%E5%8D%A1%E5%85%B0%E5%BE%B7%E7%9A%84%E9%AD%94%E9%95%9C.webp"

const HOP_MS = 2000
const RESPAWN_MS = 10 * 1000
const SIZE = 42

const active = ref(false)
const visible = ref(false)
const x = ref(0)
const y = ref(0)
const toast = ref(false)

let hopTimer: ReturnType<typeof setInterval> | undefined
let hopFadeTimer: ReturnType<typeof setTimeout> | undefined
let toastTimer: ReturnType<typeof setTimeout> | undefined
let respawnTimer: ReturnType<typeof setTimeout> | undefined

function randomPos() {
    const w = window.innerWidth
    const h = window.innerHeight
    // 安全边距：左/上常规留白，右避开传送点轨道与回顶，下避开回顶按钮
    const pad = { l: 56, r: 140, t: 116, b: 110 }
    x.value = Math.round(pad.l + Math.random() * Math.max(1, w - pad.l - pad.r - SIZE))
    y.value = Math.round(pad.t + Math.random() * Math.max(1, h - pad.t - pad.b - SIZE))
}

function hop() {
    visible.value = false
    hopFadeTimer = setTimeout(() => {
        randomPos()
        // class 摘挂重挂触发弹入动画
        requestAnimationFrame(() => {
            visible.value = true
        })
    }, 200)
}

function start() {
    active.value = true
    randomPos()
    visible.value = true
    hopTimer = setInterval(() => {
        if (!toast.value)
            hop()
    }, HOP_MS)
}

function stop() {
    if (hopTimer)
        clearInterval(hopTimer)
    if (hopFadeTimer)
        clearTimeout(hopFadeTimer)
    active.value = false
    visible.value = false
}

function catchMirror() {
    stop()
    toast.value = true
    if (toastTimer)
        clearTimeout(toastTimer)
    toastTimer = setTimeout(() => {
        toast.value = false
    }, 3800)
    // 10 秒后重生，彩蛋可重复玩
    respawnTimer = setTimeout(start, RESPAWN_MS)
}

function onError() {
    // 图标挂了整个彩蛋静默关闭，不干扰页面
    stop()
    toast.value = false
    if (respawnTimer)
        clearTimeout(respawnTimer)
}

onMounted(() => {
    // 仅桌面鼠标设备（随机点位的鼠标玩法），且等 Hero 入场演出先播完
    if (!window.matchMedia("(hover: hover) and (min-width: 960px)").matches)
        return
    respawnTimer = setTimeout(start, 4000)
})

onBeforeUnmount(() => {
    stop()
    if (toastTimer)
        clearTimeout(toastTimer)
    if (respawnTimer)
        clearTimeout(respawnTimer)
    toast.value = false
})
</script>

<style scoped lang="scss">
.yl-mirror {
    position: fixed;
    z-index: 45;
    width: 42px;
    height: 42px;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.18s ease;
    user-select: none;
    -webkit-user-drag: none;

    &.is-in {
        opacity: 1;

        img {
            animation: yl-mirror-pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
    }

    img {
        position: relative;
        z-index: 1;
        display: block;
        width: 42px;
        height: 42px;
        pointer-events: none;
        filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.6)) drop-shadow(0 0 8px rgba(232, 162, 60, 0.35));
        transition: transform 0.2s ease;
    }

    &:hover img {
        transform: scale(1.15) rotate(4deg);
    }
}

/* 魔镜光环：微弱呼吸，保证可发现但不吵 */
.yl-mirror__glow {
    position: absolute;
    inset: -10px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(232, 162, 60, 0.28), transparent 70%);
    animation: yl-mirror-glow 2.2s ease-in-out infinite;
}

@keyframes yl-mirror-glow {
    0%, 100% {
        opacity: 0.45;
    }

    50% {
        opacity: 1;
    }
}

@keyframes yl-mirror-pop-in {
    0% {
        transform: scale(0.4) rotate(-30deg);
        opacity: 0;
    }

    60% {
        transform: scale(1.18) rotate(6deg);
        opacity: 1;
    }

    100% {
        transform: scale(1) rotate(0deg);
    }
}

/* —— 祝福提示（游戏名牌风） —— */
.yl-mirror__toast {
    position: fixed;
    left: 50%;
    top: 24%;
    transform: translateX(-50%);
    z-index: 60;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 26px;
    border: 1px solid var(--yl-border-strong, rgba(232, 162, 60, 0.34));
    border-radius: 10px;
    background: rgba(20, 20, 27, 0.95);
    box-shadow: 0 10px 44px rgba(0, 0, 0, 0.6), 0 0 28px rgba(232, 162, 60, 0.2);
    pointer-events: none;

    img {
        width: 34px;
        height: 34px;
        filter: drop-shadow(0 0 8px rgba(232, 162, 60, 0.4));
        animation: yl-mirror-pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    p {
        margin: 0;
        font-size: 15px;
        font-weight: 700;
        color: var(--yl-text-primary, #ece8df);
        letter-spacing: 0.02em;

        em {
            font-style: normal;
            color: var(--yl-gold-bright, #f4bc5e);
            text-shadow: 0 0 12px rgba(232, 162, 60, 0.45);
        }
    }
}

.yl-mirror-pop-enter-active {
    animation: yl-mirror-toast-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.yl-mirror-pop-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.yl-mirror-pop-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
}

@keyframes yl-mirror-toast-in {
    from {
        opacity: 0;
        transform: translateX(-50%) translateY(-16px) scale(0.92);
    }

    to {
        opacity: 1;
        transform: translateX(-50%) translateY(0) scale(1);
    }
}

/* 触屏/窄屏不启用（脚本层已挡，样式层双保险） */
@media (hover: none), (max-width: 959px) {
    .yl-mirror,
    .yl-mirror__toast {
        display: none;
    }
}
</style>
