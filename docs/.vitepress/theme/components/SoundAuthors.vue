<script setup lang="ts" name="SoundAuthors">
import { ref, onMounted } from 'vue'

const soundVersions = [
  {
    name: '可爱妹妹',
    avatar: '/assets/avatar/可爱妹妹.png',
    platform: '',
    url: '',
  },
  {
    name: '温柔姐姐',
    avatar: '/assets/avatar/温柔姐姐.png',
    platform: '',
    url: '',
  },
  {
    name: '小结巴',
    avatar: '/assets/avatar/小结巴.png',
    platform: '抖音',
    url: 'https://v.douyin.com/ENx-T8bBb38',
  },
  {
    name: '呆哈拿',
    avatar: '/assets/avatar/呆哈拿.png',
    platform: '抖音',
    url: 'https://v.douyin.com/xWYKLucq7Os',
  },
  {
    name: '天天有一只天天',
    avatar: '/assets/avatar/天天有一只天天.png',
    platform: 'B站',
    url: 'https://space.bilibili.com/1187299907',
  },
]

const poe1Url = ref('')
const poe2Url = ref('')

onMounted(async () => {
  try {
    const res = await fetch('/api/system/getSiteSystemConfig?id=1')
    const data = await res.json()
    poe1Url.value = (data.data?.downLoadUrl || '').split(',')[0]
    poe2Url.value = (data.data?.poe2DownLoadUrl || '').split(',')[0]
  } catch (e) {
    console.error(e)
  }
})

const openPage = (url: string) => {
  if (url) window.open(url, '_blank')
}

const soundList = [
  { label: 'POE1 音效文件', password: 'akdc', urlKey: 'poe1Url' as const },
  { label: 'POE2 音效文件', password: 'akdc', urlKey: 'poe2Url' as const },
]
</script>

<template>
  <div class="sound-authors">
    <!-- 音效版本展示 -->
    <div class="section">
      <div class="section-title">
        <span>音效版本</span>
        <span class="badge">致谢音效作者</span>
      </div>
      <div class="authors-grid">
        <div v-for="item in soundVersions" :key="item.name" class="author-card">
          <img :src="item.avatar" :alt="item.name" class="avatar" />
          <div class="author-info">
            <div class="author-name">{{ item.name }}</div>
            <span v-if="item.platform" class="platform-tag">{{ item.platform }}</span>
            <span v-if="item.url" class="author-link" @click="openPage(item.url)">查看主页</span>
            <span v-else class="author-link disabled">暂无社区主页</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 网盘下载 -->
    <div class="section">
      <div class="section-title">
        <span>音效文件网盘下载</span>
        <span class="hint">如果打不开可复制下方地址手动打开</span>
      </div>
      <div class="download-list">
        <div v-for="item in soundList" :key="item.label" class="download-row">
          <div class="download-info">
            <span class="download-label">{{ item.label }}</span>
            <span class="download-pwd">密码:{{ item.password }}</span>
          </div>
          <div class="download-action">
            <span class="download-url">{{ item.urlKey === 'poe1Url' ? poe1Url : poe2Url }}</span>
            <button class="download-btn" @click="openPage(item.urlKey === 'poe1Url' ? poe1Url : poe2Url)">下载</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sound-authors {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 15px;
  font-weight: bold;
}

.badge {
  font-size: 12px;
  font-weight: normal;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--vp-c-brand-soft, #faecd8);
  color: var(--vp-c-brand-1, #e6a23c);
}

.hint {
  font-size: 13px;
  font-weight: normal;
  opacity: 0.6;
}

.authors-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.author-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  padding: 8px;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  text-align: center;
}

.platform-tag {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--vp-c-brand-soft, #faecd8);
  color: var(--vp-c-brand-1, #e6a23c);
  white-space: nowrap;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
}

.author-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.author-name {
  font-size: 14px;
  font-weight: bold;
  white-space: nowrap;
}

.author-link {
  font-size: 12px;
  color: var(--vp-c-brand-1, #e6a23c);
  cursor: pointer;
}

.author-link:hover {
  text-decoration: underline;
}

.author-link.disabled {
  color: inherit;
  opacity: 0.5;
  cursor: default;
}

.download-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.download-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.download-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.download-label {
  font-size: 14px;
  font-weight: bold;
}

.download-pwd {
  font-size: 12px;
  color: var(--vp-c-brand-1, #e6a23c);
}

.download-action {
  display: flex;
  align-items: center;
  gap: 8px;
}

.download-url {
  font-size: 12px;
  opacity: 0.6;
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.download-btn {
  font-size: 13px;
  padding: 4px 12px;
  border: none;
  border-radius: 4px;
  background: var(--vp-c-brand-1, #e6a23c);
  color: #fff;
  cursor: pointer;
}

.download-btn:hover {
  background: var(--vp-c-brand-2, #edb776);
}
</style>
