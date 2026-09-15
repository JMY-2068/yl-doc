<template>
    <button type="button" class="yl-shot" @click="open = true">
        <div class="yl-shot__bar">
            <span class="yl-shot__dots" aria-hidden="true"><i /><i /><i /></span>
            <span class="yl-shot__label">编辑器实际界面</span>
            <span class="yl-shot__hint">点击放大</span>
        </div>
        <div class="yl-shot__frame">
            <img :src="src" :alt="alt" :style="pos ? { objectPosition: pos } : undefined" loading="lazy">
        </div>
    </button>
    <Teleport to="body">
        <Transition name="yl-shot-fade">
            <div v-if="open" class="yl-shotbox" @click="open = false">
                <img :src="src" :alt="alt">
                <p v-if="caption" class="yl-shotbox__caption">{{ caption }}</p>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue"

// 各幕共用的"编辑器实际界面"窗框缩略图 + 点击放大 lightbox
// pos：缩略图裁切的 object-position（纵向上取哪一段）
defineProps<{
    src: string
    alt?: string
    caption?: string
    pos?: string
}>()

const open = ref(false)

function onKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") open.value = false
}

onMounted(() => window.addEventListener("keydown", onKeydown))
onBeforeUnmount(() => window.removeEventListener("keydown", onKeydown))
</script>

<style scoped lang="scss">
.yl-shot {
    display: block;
    width: 100%;
    margin-top: 16px;
    text-align: left;
    background: var(--yl-bg-elevated);
    border: 1px solid var(--yl-border-plain);
    border-radius: var(--yl-radius-lg);
    overflow: hidden;
    cursor: zoom-in;
    padding: 0;
    transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;

    &:hover {
        border-color: var(--yl-border-strong);
        box-shadow: 0 8px 28px rgba(0, 0, 0, 0.4);
        transform: translateY(-2px);

        .yl-shot__frame img {
            filter: none;
        }
    }
}

.yl-shot__bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: rgba(0, 0, 0, 0.25);
    border-bottom: 1px solid var(--yl-border-plain);
}

.yl-shot__dots {
    display: flex;
    gap: 5px;

    i {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--yl-border-strong);
    }
}

.yl-shot__label {
    font-family: var(--yl-font-mono);
    font-size: 12px;
    letter-spacing: 0.08em;
    color: var(--yl-text-secondary);
}

.yl-shot__hint {
    margin-left: auto;
    font-size: 11px;
    color: var(--yl-text-faint);
}

.yl-shot__frame {
    height: 150px;

    img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
        filter: saturate(0.92) brightness(0.94);
        transition: filter 0.25s ease;
    }
}

/* —— lightbox：点击放大查看原图 —— */
.yl-shotbox {
    position: fixed;
    inset: 0;
    z-index: 999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    padding: 24px;
    background: rgba(5, 5, 8, 0.88);
    backdrop-filter: blur(6px);
    cursor: zoom-out;

    img {
        max-width: min(1400px, 94vw);
        max-height: 80vh;
        border-radius: var(--yl-radius-lg);
        border: 1px solid var(--yl-border-strong);
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6);
    }
}

.yl-shotbox__caption {
    font-family: var(--yl-font-mono);
    font-size: 13px;
    letter-spacing: 0.06em;
    color: var(--yl-text-secondary);
}

.yl-shot-fade-enter-active,
.yl-shot-fade-leave-active {
    transition: opacity 0.25s ease;
}

.yl-shot-fade-enter-from,
.yl-shot-fade-leave-to {
    opacity: 0;
}

@media (max-width: 959px) {
    .yl-shot__frame {
        height: 120px;
    }
}
</style>
