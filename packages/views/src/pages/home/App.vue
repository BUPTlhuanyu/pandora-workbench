<template>
    <div class="pandora-home">
        <HomeHeader />
        <HomeContent />
        <HomeFooter />
    </div>
</template>

<script setup lang="ts">
import './index.less';
import HomeHeader from 'views/src/pages/home/container/header/index.vue';
import HomeContent from 'views/src/pages/home/container/content/index.vue';
import HomeFooter from 'views/src/pages/home/container/footer/index.vue';
</script>
