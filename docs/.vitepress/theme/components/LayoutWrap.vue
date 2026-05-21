<script setup lang="ts">
import { onMounted, onUnmounted, watch } from "vue"
import { useRoute } from "vitepress"

// 折叠按钮箭头图标
const arrow = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>`

// 为每个一级侧边栏分组注入折叠按钮
function inject() {
    const groups = document.querySelectorAll(".VPSidebarItem.level-1")
    if (!groups.length) return
    groups.forEach((group) => {
        if (group.querySelector(".sidebar-collapse-btn")) return
        const textEl = group.querySelector(":scope > .item .text")
        if (!textEl) return
        const items = group.querySelector(":scope > .items")
        if (!items) return
        const btn = document.createElement("button")
        btn.className = "sidebar-collapse-btn"
        btn.innerHTML = arrow
        btn.setAttribute("aria-label", "折叠/展开")
        textEl.appendChild(btn)
        const itemEl = group.querySelector(":scope > .item") as HTMLElement | null
        if (itemEl) {
            itemEl.style.cursor = "pointer"
            itemEl.style.userSelect = "none"
            itemEl.addEventListener("click", (e) => {
                e.stopPropagation()
                group.classList.toggle("collapsed")
            })
        }
    })
}

function observeSidebar() {
    const sidebar = document.querySelector(".VPSidebar")
    if (sidebar) {
        new MutationObserver(() => inject()).observe(sidebar, { childList: true, subtree: true })
        inject()
    }
}

// 导航栏时钟
let clockTimer: ReturnType<typeof setInterval>

function injectClock() {
    const target = document.querySelector(".tk-theme-enhance")
    if (!target || document.querySelector(".nav-clock")) return

    const clockEl = document.createElement("span")
    clockEl.className = "nav-clock"
    clockEl.style.cssText = "font-size:16px;color:var(--vp-c-text-2);margin-left:8px;font-variant-numeric:tabular-nums;"

    function updateClock() {
        clockEl.textContent = new Date().toLocaleTimeString("zh-CN", {
            hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
        })
    }
    updateClock()
    clockTimer = setInterval(updateClock, 1000)
    target.parentElement!.insertBefore(clockEl, target.nextSibling)
}

const route = useRoute()

onMounted(() => {
    observeSidebar()
    setTimeout(observeSidebar, 1000)
    injectClock()
    setTimeout(injectClock, 500)
})

onUnmounted(() => clearInterval(clockTimer))

watch(() => route.path, () => {
    setTimeout(inject, 500)
    setTimeout(injectClock, 500)
})
</script>

<template>
    <slot />
</template>
