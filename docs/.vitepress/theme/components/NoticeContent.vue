<script setup lang="ts" name="NoticeContent">
const namespace = "notice";

const handleClick = () => {
  window.location.href = '/tool/extend'
}
</script>

<template>
    <div :class="namespace">
        <p>
            1.6.3远古回响国服正式版过滤已更新,国际服通用，点击下载懒人包去下载!!!
        </p>
        <p>
            2.新做了一个Vs Code的本地过滤编辑的增强扩展,适合喜欢文本编辑过滤的,<span @click="handleClick">去了解</span>
        </p>
        <p>
            3.编辑网站已支持poe2过滤的暗金和血脉辅助宝石和符文物价排序
        </p>
    </div>
</template>

<style lang="scss" scoped>
.notice {
    img {
        width: 100%;
        height: 120px;
        object-fit: contain;
    }

    p {
        font-size: 14px;
        padding: 10px 0;
    }
    span{
        cursor: pointer;
        text-decoration: underline;
        color:var(--vp-c-brand);
    }
}
</style>