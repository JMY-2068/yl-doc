<script setup lang="ts" name="NoticeContent">
import { ref, onMounted } from 'vue'

const namespace = "notice";

const version = ref('')
const poe2Version = ref('')
const lastUpdate = ref('')
const poe2LastUpdate = ref('')
const filterDownLoadUrl = ref('')
const filter2DownLoadUrl = ref('')

onMounted(async () => {
  try {
    const res = await fetch('/api/system/getSiteSystemConfig?id=1')
    const data = await res.json()
    version.value = data.data?.version || ''
    poe2Version.value = data.data?.poe2Version || ''
    lastUpdate.value = data.data?.lastUpdate || ''
    poe2LastUpdate.value = data.data?.poe2LastUpdate || ''
    filterDownLoadUrl.value = data.data?.filterDownLoadUrl || ''
    filter2DownLoadUrl.value = data.data?.filter2DownLoadUrl || ''
  } catch (e) {
    console.error(e)
  }
})

const handleClick = (url?: string) => {
  if (url) {
    window.open(url, '_blank')
  } else {
    window.location.href = '/download'
  }
}
</script>

<template>
    <div :class="namespace">
        <div v-if="version" class="notice-item">
            <span class="notice-index">1</span>
            <div class="notice-body">
                <div class="notice-head">
                    <span class="notice-tag tag-poe1">POE1</span>
                    <span v-if="version" class="notice-version">v{{ version }}</span>
                    <span v-if="lastUpdate" class="notice-date">{{ lastUpdate }}</span>
                </div>
                <div class="notice-desc">过滤已更新，国服 / 国际服通用</div>
                <button class="notice-btn" @click="handleClick(filterDownLoadUrl)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    点击下载懒人包
                </button>
            </div>
        </div>

        <div v-if="poe2Version" class="notice-item">
            <span class="notice-index">2</span>
            <div class="notice-body">
                <div class="notice-head">
                    <span class="notice-tag tag-poe2">POE2</span>
                    <span v-if="poe2Version" class="notice-version">v{{ poe2Version }}</span>
                    <span v-if="poe2LastUpdate" class="notice-date">{{ poe2LastUpdate }}</span>
                </div>
                <div class="notice-desc">过滤已更新，国服 / 国际服通用</div>
                <div class="notice-actions">
                    <button class="notice-btn" @click="handleClick(filter2DownLoadUrl)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        点击下载懒人包
                    </button>
                    <a class="notice-link" href="https://docs.qq.com/doc/DTFNISFpMUkxVaUh0" target="_blank" rel="noopener noreferrer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                        更新日志详见
                    </a>
                </div>
            </div>
        </div>

        <div class="notice-item">
            <span class="notice-index">3</span>
            <div class="notice-body">
                <div class="notice-desc">编辑网站已支持 poe2 过滤的暗金和血脉辅助宝石、符文物价排序</div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.notice {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .notice-item {
        display: flex;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 8px;
        background: var(--vp-c-bg-soft);
        border: 1px solid var(--vp-c-divider);
        transition: border-color 0.2s ease, box-shadow 0.2s ease;

        &:hover {
            border-color: var(--vp-c-brand-1);
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
        }
    }

    .notice-index {
        flex-shrink: 0;
        width: 22px;
        height: 22px;
        line-height: 22px;
        text-align: center;
        font-size: 12px;
        font-weight: 700;
        border-radius: 50%;
        color: var(--vp-c-white);
        background: var(--vp-c-brand-1);
    }

    .notice-body {
        flex: 1;
        min-width: 0;
    }

    .notice-head {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 6px;
    }

    .notice-tag {
        flex-shrink: 0;
        padding: 1px 8px;
        font-size: 12px;
        font-weight: 600;
        border-radius: 4px;
        color: var(--vp-c-white);
        background: var(--vp-c-brand-1);
    }

    .notice-version {
        font-size: 13px;
        font-weight: 600;
        color: var(--vp-c-brand-1);
    }

    .notice-date {
        font-size: 12px;
        color: var(--vp-c-text-2);
    }

    .notice-desc {
        font-size: 13px;
        line-height: 1.6;
        color: var(--vp-c-text-1);
    }

    .notice-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 8px;
    }

    .notice-btn,
    .notice-link {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        font-size: 12px;
        font-weight: 500;
        border-radius: 6px;
        cursor: pointer;
        text-decoration: none;
        border: 1px solid var(--vp-c-brand-1);
        color: var(--vp-c-brand-1);
        background: transparent;
        transition: color 0.2s ease, background 0.2s ease;

        svg {
            flex-shrink: 0;
        }

        &:hover {
            color: var(--vp-c-white);
            background: var(--vp-c-brand-1);
        }
    }
}
</style>
