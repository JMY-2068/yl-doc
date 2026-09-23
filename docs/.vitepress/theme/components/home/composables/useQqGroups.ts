import { ref } from "vue"

// QQ 交流群列表：取自 system 表 id=2 社区配置（编辑器"系统配置管理-社区配置"维护）
// 取数链路：相对 /api 代理（dev 由 Vite proxy 转发）→ 直连 prod → 静态回退
// 回退数据与编辑器 src/data/qq-groups.ts 保持同源（迁移前各端写死的群信息）

export interface QqGroup {
    /** 群号 */
    id: string
    /** 群名 */
    title?: string
    /** 标签文案 */
    tag: string
    /** 加群链接 */
    link: string
    /** 是否已满（降透明度标记） */
    full: boolean
}

const FALLBACK_GROUPS: QqGroup[] = [
    { id: "663896689", tag: "活跃聊天 已满", full: true, link: "https://qm.qq.com/q/r5NmIj4XTM" },
    { id: "225616278", tag: "潜水下载", full: false, link: "https://qm.qq.com/q/utSaj5dfNu" },
    { id: "621055124", tag: "潜水下载", full: false, link: "https://qm.qq.com/q/wT190TKwJq" },
    { id: "495451331", tag: "活跃聊天 已满", full: true, link: "https://qm.qq.com/q/KAsjF2w0A8" },
    { id: "476921399", tag: "潜水下载", full: false, link: "https://qm.qq.com/q/mrL90bDCLe" },
]

export function useQqGroups() {
    const qqGroups = ref<QqGroup[]>(FALLBACK_GROUPS)

    async function fetchQqGroups() {
        const urls = ["/api/system/getSiteSystemConfig?id=2", "https://api.filtereditor.cn/prod/system/getSiteSystemConfig?id=2"]
        for (const url of urls) {
            try {
                const res = await fetch(url)
                const data = (await res.json()).data as { qqGroups?: QqGroup[] }
                if (data?.qqGroups?.length) {
                    qqGroups.value = data.qqGroups
                    return
                }
            }
            catch { /* 尝试下一个地址 */ }
        }
    }

    return { qqGroups, fetchQqGroups }
}
