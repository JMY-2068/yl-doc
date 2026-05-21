<script setup lang="ts" name="NoticeContent">
const namespace = "notice";
</script>

<template>
    <div :class="namespace">
        全新一乐过滤文档上线了 🎉🎉🎉!!!
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
        text-align: center;
        font-size: 14px;
        padding: 10px 0;
    }
}
</style>