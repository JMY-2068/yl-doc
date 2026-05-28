<script setup lang="ts" name="NoticeContent">
const namespace = "notice";
</script>

<template>
    <div :class="namespace">
        <p>1.全新一乐过滤文档上线了 🎉🎉🎉!!!</p>
        <p>
            2.国际服先行版过滤已更新，点击下载懒人包去下载!!!
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
}
</style>