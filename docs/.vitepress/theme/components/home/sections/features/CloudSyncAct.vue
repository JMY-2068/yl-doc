<template>
    <div ref="root" class="yl-act6">
        <div class="yl-act__grid yl-act6__grid">
            <!-- 左列：文案 -->
            <div class="yl-act__copy">
                <p class="yl-act__kicker" data-rise>功能长廊 · ACT 06 / 06</p>
                <h3 class="yl-act__title" data-rise style="--d: 0.06s">云过滤同步，国服一键上传</h3>
                <p class="yl-act6__desc" data-rise style="--d: 0.12s">
                    当前编辑的过滤一键上传官网云过滤——游戏内切换即生效，多设备无缝衔接。
                </p>
                <ul class="yl-act__list">
                    <li v-for="(s, i) in listCopy" :key="i" data-rise :style="{ '--d': 0.18 + i * 0.08 + 's' }">
                        <span class="yl-act__num">{{ String(i + 1).padStart(2, "0") }}</span>
                        <span>{{ s }}</span>
                    </li>
                </ul>
            </div>

            <!-- 右列：演示（mini 同步弹窗：左我的云过滤 + 右同步卡） -->
            <div class="yl-act__demo">
                <div ref="panel" class="yl-panel yl-cs" data-rise style="--d: 0.1s">
                    <div class="yl-panel__head">
                        <span class="yl-panel__dots" aria-hidden="true"><i /><i /><i /></span>
                        <span class="yl-panel__title">云过滤同步 · 同步到云过滤使用</span>
                    </div>

                    <!-- 成功提示条（同步完成后展示，文案取自编辑器真实提示） -->
                    <div v-if="done" class="yl-cs__ok" data-rise>
                        <span>同步成功！游戏内切换或重新加载过滤即可生效（对应蓝色字体过滤）</span>
                    </div>

                    <div class="yl-cs__body">
                        <!-- 左：我的云过滤列表（云图标 + 光点上浮动画 + 条目） -->
                        <div class="yl-cs__list">
                            <div class="yl-cs__list-head">
                                <span class="yl-cs__list-title">我的云过滤</span>
                                <span class="yl-cs__cloud" :class="{ 'is-syncing': syncing }" aria-hidden="true">
                                    <i class="yl-cs__dot"></i><i class="yl-cs__dot"></i><i class="yl-cs__dot"></i>
                                </span>
                            </div>
                            <div class="yl-cs__items">
                                <div
                                    v-for="f in cloudList"
                                    :key="f.name + f.time"
                                    class="yl-cs__item"
                                    :class="{ 'is-new': f.isNew }"
                                >
                                    <div class="yl-cs__item-main">
                                        <b>{{ f.name }}</b>
                                        <span v-if="f.isPublic" class="yl-cs__tag is-public">公开</span>
                                    </div>
                                    <div class="yl-cs__item-sub">
                                        <span class="yl-cs__tag" :class="f.platform.includes('2') ? 'is-poe2' : 'is-poe1'">{{ f.platform }}</span>
                                        <span class="yl-cs__item-time">最近更新: {{ f.time }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 右：同步卡（真实表单的精简版） -->
                        <div class="yl-cs__form">
                            <div class="yl-cs__row">
                                <span class="yl-cs__label">过滤名称</span>
                                <span class="yl-cs__name" :title="finalName">{{ finalName }}</span>
                            </div>
                            <div class="yl-cs__row">
                                <span class="yl-cs__label">音效模式</span>
                                <div class="yl-cs__segs">
                                    <button type="button" :class="{ 'is-on': soundType === 'custom' }" @click="soundType = 'custom'">自定义音效</button>
                                    <button type="button" :class="{ 'is-on': soundType === 'system' }" @click="soundType = 'system'">系统音效</button>
                                </div>
                            </div>
                            <div v-if="soundType === 'custom'" class="yl-cs__row">
                                <span class="yl-cs__label">音效版本</span>
                                <div class="yl-cs__segs">
                                    <button type="button" :class="{ 'is-on': soundSource === 'meimei' }" @click="soundSource = 'meimei'">妹妹音效</button>
                                    <button type="button" :class="{ 'is-on': soundSource === 'jieba' }" @click="soundSource = 'jieba'">小结巴音效</button>
                                </div>
                            </div>
                            <div class="yl-cs__row">
                                <span class="yl-cs__label">过滤模式</span>
                                <div class="yl-cs__segs">
                                    <button type="button" :class="{ 'is-on': syncType === '1' }" @click="syncType = '1'">正常模式</button>
                                    <button type="button" :class="{ 'is-on': syncType === '2' }" @click="syncType = '2'">纯净模式</button>
                                </div>
                            </div>
                            <div class="yl-cs__row">
                                <span class="yl-cs__label">是否公开</span>
                                <button type="button" class="yl-cs__switch" :class="{ 'is-on': isPublic }" @click="isPublic = !isPublic">
                                    <i></i>
                                    <span>{{ isPublic ? "公开" : "不公开" }}</span>
                                </button>
                            </div>

                            <div class="yl-cs__foot">
                                <button type="button" class="yl-cs__sync" :disabled="syncing" @click="sync">
                                    <span v-if="syncing" class="yl-cs__spin" aria-hidden="true"></span>
                                    {{ syncing ? "同步中…" : "确认同步" }}
                                </button>
                                <button type="button" class="yl-cs__reset" @click="reset">重置演示</button>
                            </div>
                            <p class="yl-cs__note">示例数据 · 演示同步流程，实际使用需填论坛名称与 Cookie</p>
                        </div>
                    </div>
                </div>

                <!-- 编辑器实际界面：同步弹窗主界面截图 -->
                <div class="yl-cs__shots" data-rise style="--d: 0.3s">
                    <ShotThumb src="/assets/index/云过滤同步.webp" alt="编辑器云过滤同步界面" caption="编辑器实际界面 · 同步到云过滤" pos="50% 40%" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue"
import ShotThumb from "./ShotThumb.vue"

// 第六幕（收官）：云过滤同步——把当前编辑的过滤一键上传官网云过滤，游戏内蓝色字体过滤直接切换使用
// mini 复刻同步弹窗：左「我的云过滤」列表 + 右精简同步卡（音效/过滤模式/公开）+ 上传动画（光点升入云端）
// 表单凭据（论坛名称/Cookie）不演示，备注说明

interface CloudFilter {
    name: string
    platform: string
    time: string
    isPublic: boolean
    isNew?: boolean
}

const INIT_LIST: CloudFilter[] = [
    { name: "一乐过滤 · 赛季特调", platform: "PoE 2", time: "2026-09-10", isPublic: true },
    { name: "一乐过滤 · 开荒版", platform: "PoE 2", time: "2026-08-28", isPublic: false },
    { name: "一乐过滤 · POE1 经典", platform: "PoE 1", time: "2026-08-15", isPublic: false },
]

const listCopy = [
    "一键同步至官网云过滤，免下载免复制",
    "游戏内蓝色字体过滤，切换即生效",
    "公开分享，好友一键订阅你的配置",
    "多设备无缝切换，云端统一管理",
]

const root = ref<HTMLElement>()

const filterName = ref("一乐过滤 · 我的定制")
const soundType = ref<"custom" | "system">("custom")
const soundSource = ref<"meimei" | "jieba">("meimei")
const syncType = ref<"1" | "2">("1")
const isPublic = ref(false)

const cloudList = ref<CloudFilter[]>(INIT_LIST.map(f => ({ ...f, isNew: false })))
const syncing = ref(false)
const done = ref(false)
let syncTimer: ReturnType<typeof setTimeout> | undefined

// 纯净模式发送时自动加「纯净-」前缀（仅影响发送值，同编辑器真实行为）
const finalName = computed(() => (syncType.value === "2" ? `纯净-${filterName.value}` : filterName.value))

// 同步：光点升云动画（syncing 期间云辉光+光点循环）→ 列表插入/更新条目 + 成功提示
function sync() {
    if (syncing.value)
        return
    syncing.value = true
    done.value = false
    cloudList.value.forEach(f => (f.isNew = false))
    if (syncTimer)
        clearTimeout(syncTimer)
    syncTimer = setTimeout(() => {
        const exists = cloudList.value.find(f => f.name === finalName.value)
        if (exists) {
            // 同名条目走「更新云过滤」语义：刷新时间并高亮
            exists.time = "2026-09-15"
            exists.isPublic = isPublic.value
            exists.isNew = true
            cloudList.value = [...cloudList.value]
        }
        else {
            cloudList.value.unshift({ name: finalName.value, platform: "PoE 2", time: "2026-09-15", isPublic: isPublic.value, isNew: true })
        }
        syncing.value = false
        done.value = true
    }, 1200)
}

function reset() {
    if (syncTimer)
        clearTimeout(syncTimer)
    cloudList.value = INIT_LIST.map(f => ({ ...f, isNew: false }))
    syncing.value = false
    done.value = false
    soundType.value = "custom"
    soundSource.value = "meimei"
    syncType.value = "1"
    isPublic.value = false
}

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
                requestAnimationFrame(() => requestAnimationFrame(riseIn))
                io?.disconnect()
            }
        },
        { threshold: 0.25 },
    )
    io.observe(root.value)
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
    if (syncTimer) clearTimeout(syncTimer)
})
</script>

<style scoped lang="scss">
.yl-act6 {
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

/* 第六幕回两列：文案左、演示右（收官收窄回归） */
.yl-act6__grid {
    grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
}

/* —— 入场：淡入 + 上浮 —— */
.yl-act6.js-anim [data-rise] {
    opacity: 0;
    transform: translateY(24px);
}

.yl-act6.js-anim.is-in [data-rise] {
    opacity: 1;
    transform: none;
    /* 注意：构建管线会吃掉 transition 简写里的 var()，必须拆 longhand */
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

.yl-act6__desc {
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
    overflow: hidden;
    text-overflow: ellipsis;
}

/* —— 成功提示条 —— */
.yl-cs__ok {
    margin-bottom: 12px;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 700;
    color: #67c23a;
    border: 1px solid rgba(103, 194, 58, 0.4);
    border-radius: var(--yl-radius);
    background: rgba(103, 194, 58, 0.07);
    animation: yl-act6-ok-in 0.4s ease both;
}

@keyframes yl-act6-ok-in {
    from {
        opacity: 0;
        transform: translateY(-6px);
    }

    to {
        opacity: 1;
        transform: none;
    }
}

/* —— 主体：左列表 / 右同步卡 —— */
.yl-cs__body {
    display: grid;
    grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
    gap: 14px;
    align-items: stretch;
}

/* 左：云过滤列表 */
.yl-cs__list {
    display: flex;
    flex-direction: column;
    border-radius: var(--yl-radius);
    background: rgba(0, 0, 0, 0.18);
    padding: 10px 12px;
    min-height: 320px;
}

.yl-cs__list-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--yl-border-plain);
    margin-bottom: 8px;
}

.yl-cs__list-title {
    font-size: 13px;
    font-weight: 700;
    color: var(--yl-text-primary);
}

/* 云图标（CSS 绘制）：同步时辉光呼吸，光点依次升入 */
.yl-cs__cloud {
    position: relative;
    width: 34px;
    height: 14px;
    border-radius: 7px;
    background: var(--yl-border-strong);
    transition: box-shadow 0.3s ease, background-color 0.3s ease;

    &::before,
    &::after {
        content: "";
        position: absolute;
        border-radius: 50%;
        background: inherit;
    }

    &::before {
        width: 16px;
        height: 16px;
        left: 5px;
        top: -9px;
    }

    &::after {
        width: 11px;
        height: 11px;
        right: 5px;
        top: -5px;
    }

    &.is-syncing {
        background: var(--yl-gold-bright);
        animation: yl-act6-cloud-glow 1s ease-in-out infinite;
    }
}

@keyframes yl-act6-cloud-glow {
    0%, 100% {
        box-shadow: 0 0 6px rgba(232, 162, 60, 0.35);
    }

    50% {
        box-shadow: 0 0 20px rgba(232, 162, 60, 0.8);
    }
}

/* 光点：同步期间从云下方依次升入消散 */
.yl-cs__dot {
    position: absolute;
    left: 50%;
    top: 18px;
    width: 5px;
    height: 5px;
    margin-left: -2.5px;
    border-radius: 50%;
    background: var(--yl-gold-bright);
    opacity: 0;

    .yl-cs__cloud.is-syncing & {
        animation: yl-act6-dot-rise 0.9s ease-in infinite;
    }

    &:nth-child(2) {
        animation-delay: 0.3s;
    }

    &:nth-child(3) {
        animation-delay: 0.6s;
    }
}

@keyframes yl-act6-dot-rise {
    0% {
        opacity: 0;
        transform: translateY(0) scale(1);
    }

    25% {
        opacity: 1;
    }

    100% {
        opacity: 0;
        transform: translateY(-24px) scale(0.4);
    }
}

.yl-cs__items {
    display: flex;
    flex-direction: column;
    gap: 7px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--yl-border-strong) transparent;

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-thumb {
        background: var(--yl-border-strong);
        border-radius: 3px;
    }
}

.yl-cs__item {
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 8px 10px;
    border: 1px solid var(--yl-border-plain);
    border-radius: var(--yl-radius-sm);
    background: rgba(0, 0, 0, 0.2);

    &.is-new {
        border-color: rgba(103, 194, 58, 0.5);
        animation: yl-act6-item-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
}

@keyframes yl-act6-item-in {
    from {
        opacity: 0;
        transform: translateY(-8px) scale(0.98);
    }

    to {
        opacity: 1;
        transform: none;
    }
}

.yl-cs__item-main {
    display: flex;
    align-items: center;
    gap: 7px;

    b {
        font-size: 13px;
        color: var(--yl-text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}

.yl-cs__item-sub {
    display: flex;
    align-items: center;
    gap: 8px;
}

.yl-cs__tag {
    flex-shrink: 0;
    font-family: var(--yl-font-mono);
    font-size: 10px;
    border-radius: var(--yl-radius-sm);
    padding: 1px 6px;
    border: 1px solid var(--yl-border-plain);
    color: var(--yl-text-secondary);

    &.is-poe2 {
        color: #67c23a;
        border-color: rgba(103, 194, 58, 0.4);
    }

    &.is-poe1 {
        color: var(--yl-gold);
        border-color: var(--yl-border-strong);
    }

    &.is-public {
        color: #e6a23c;
        border-color: rgba(230, 162, 60, 0.45);
        background: rgba(230, 162, 60, 0.08);
    }
}

.yl-cs__item-time {
    font-size: 11px;
    color: var(--yl-text-faint);
}

/* 右：同步卡 */
.yl-cs__form {
    display: flex;
    flex-direction: column;
    gap: 13px;
    border-radius: var(--yl-radius);
    background: rgba(0, 0, 0, 0.18);
    padding: 13px 14px;
}

.yl-cs__row {
    display: flex;
    align-items: center;
    gap: 12px;
}

.yl-cs__label {
    flex-shrink: 0;
    width: 60px;
    font-size: 12px;
    color: var(--yl-text-secondary);
}

.yl-cs__name {
    min-width: 0;
    font-size: 13px;
    font-weight: 700;
    color: var(--yl-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 5px 10px;
    border: 1px solid var(--yl-border-plain);
    border-radius: var(--yl-radius-sm);
    background: rgba(0, 0, 0, 0.25);
    transition: color 0.25s ease;
}

.yl-cs__segs {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;

    button {
        padding: 5px 12px;
        font-size: 12px;
        color: var(--yl-text-secondary);
        background: rgba(0, 0, 0, 0.25);
        border: 1px solid var(--yl-border-plain);
        border-radius: 999px;
        cursor: pointer;
        transition: color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;

        &.is-on {
            color: var(--yl-gold-bright);
            border-color: var(--yl-border-strong);
            background: rgba(232, 162, 60, 0.1);
        }
    }
}

/* 公开开关 */
.yl-cs__switch {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 12px;
    color: var(--yl-text-secondary);

    i {
        width: 30px;
        height: 16px;
        border-radius: 8px;
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid var(--yl-border-plain);
        position: relative;
        transition: background-color 0.2s ease, border-color 0.2s ease;

        &::after {
            content: "";
            position: absolute;
            left: 2px;
            top: 2px;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: var(--yl-text-secondary);
            transition: transform 0.2s ease, background-color 0.2s ease;
        }
    }

    &.is-on {
        color: var(--yl-gold-bright);

        i {
            background: rgba(232, 162, 60, 0.35);
            border-color: var(--yl-border-strong);

            &::after {
                transform: translateX(14px);
                background: var(--yl-gold-bright);
            }
        }
    }
}

.yl-cs__foot {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 4px;
}

.yl-cs__sync {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 20px;
    font-size: 14px;
    font-weight: 700;
    color: #1b1305;
    background: linear-gradient(135deg, var(--yl-gold-bright), var(--yl-gold-deep));
    border: none;
    border-radius: var(--yl-radius);
    cursor: pointer;
    box-shadow: 0 2px 14px rgba(232, 162, 60, 0.35);
    transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease, opacity 0.2s ease;

    &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 18px rgba(232, 162, 60, 0.45);
    }

    &:disabled {
        opacity: 0.75;
        cursor: wait;
    }
}

.yl-cs__spin {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid rgba(27, 19, 5, 0.35);
    border-top-color: #1b1305;
    animation: yl-act6-spin 0.7s linear infinite;
}

@keyframes yl-act6-spin {
    to {
        transform: rotate(360deg);
    }
}

.yl-cs__reset {
    padding: 8px 16px;
    font-size: 12px;
    color: var(--yl-text-secondary);
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid var(--yl-border-plain);
    border-radius: var(--yl-radius);
    cursor: pointer;
    transition: border-color 0.2s ease, color 0.2s ease;

    &:hover {
        color: var(--yl-text-primary);
        border-color: var(--yl-border-strong);
    }
}

.yl-cs__note {
    font-size: 11px;
    color: var(--yl-text-faint);
}

/* —— 底部截图（单张限宽居中） —— */
.yl-cs__shots {
    max-width: 560px;
    margin-inline: auto;

    :deep(.yl-shot) {
        margin-top: 16px;
    }
}

/* —— 移动端 —— */
@media (max-width: 959px) {
    .yl-act6__grid {
        grid-template-columns: 1fr;
        gap: 28px;
    }

    .yl-panel {
        padding: 14px 14px 16px;
    }

    .yl-cs__body {
        grid-template-columns: 1fr;
    }

    .yl-cs__list {
        min-height: 0;
    }

    .yl-cs__row {
        flex-wrap: wrap;
    }
}
</style>
