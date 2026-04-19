<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        :style="style"
        :class="['Icon', className]"
        width="24"
        height="24"
        viewBox="0 0 24 24"
    >
        <path
            v-for="(item, index) in pathData"
            :key="`${type}-${index}`"
            :fill="mergedItem(item).fill"
            :transform="mergedItem(item).transform"
            :d="mergedItem(item).d"
        />
    </svg>
</template>

<script setup lang="ts">
import ICONS from './icon';

const props = withDefaults(defineProps<{
    type?: string;
    options?: Record<string, any>;
    className?: string;
    style?: Record<string, any>;
}>(), {
    type: '',
    options: () => ({}),
    className: '',
    style: () => ({})
});

const pathData = ICONS[props.type] || [];

function mergedItem(item: Record<string, any>) {
    return {...item, ...props.options};
}
</script>
