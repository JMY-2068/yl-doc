<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue"

const time = ref("")

function update() {
    const now = new Date()
    time.value = now.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })
}

let timer: ReturnType<typeof setInterval>
onMounted(() => {
    update()
    timer = setInterval(update, 1000)
})
onUnmounted(() => clearInterval(timer))
</script>

<template>
    <span class="nav-clock">{{ time }}</span>
</template>

<style scoped>
.nav-clock {
    font-size: 13px;
    color: var(--vp-c-text-2);
    font-variant-numeric: tabular-nums;
}
</style>
