<script setup lang="ts" name="NoticeContent">
const namespace = "notice";
</script>

<template>
    <div :class="namespace">
        <p>
            6.1热门白装底整理版本已更新，点击下载懒人包去下载!!!
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