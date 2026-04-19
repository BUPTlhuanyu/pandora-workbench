<template>
    <div class="pandora-markdown-footer">
        {{ count }} 词
    </div>
</template>

<script setup lang="ts">
import './index.less';

withDefaults(defineProps<{
    count?: number;
}>(), {
    count: 0
});
</script>
