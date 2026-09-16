import { ref } from "vue"

// 站点版本信息（POE1 / POE2 版本号 + 更新日期）
// 取数链路：相对 /api 代理（dev 由 Vite proxy 转发）→ 直连 prod → 静态回退
// Hero 数据带与 CTA 终章共用；发版后无需改首页代码

interface SiteConfig {
    version?: string
    lastUpdate?: string
    poe2Version?: string
    poe2LastUpdate?: string
}

const FALLBACK_POE1 = { v: "3.29.2", d: "2026-08-17" }
const FALLBACK_POE2 = { v: "2.0.8", d: "2026-09-12" }

export function useSiteVersions() {
    const poe1 = ref({ ...FALLBACK_POE1 })
    const poe2 = ref({ ...FALLBACK_POE2 })

    async function fetchSiteVersions() {
        const urls = ["/api/system/getSiteSystemConfig?id=1", "https://api.filtereditor.cn/prod/system/getSiteSystemConfig?id=1"]
        for (const url of urls) {
            try {
                const res = await fetch(url)
                const data = (await res.json()).data as SiteConfig
                if (!data?.version && !data?.poe2Version)
                    continue
                if (data.version)
                    poe1.value = { v: data.version, d: data.lastUpdate ?? FALLBACK_POE1.d }
                if (data.poe2Version)
                    poe2.value = { v: data.poe2Version, d: data.poe2LastUpdate ?? FALLBACK_POE2.d }
                return
            }
            catch { /* 尝试下一个地址 */ }
        }
    }

    return { poe1, poe2, fetchSiteVersions }
}
