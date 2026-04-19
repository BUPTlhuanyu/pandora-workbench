<template>
    <div :class="['toc-wrapper', className]">
        <div
            v-for="(item, index) in data"
            :key="item.line"
            class="toc-item"
            :style="{paddingLeft: `${item.level * 15}px`}"
            @click="onSelect(item, index)"
        >
            <a :class="selectedId === index ? 'toc-link-selected toc-link' : 'toc-link'">
                {{ item.title }}
            </a>
        </div>
    </div>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import './index.less';

export interface ITocItem {
    title: string;
    line: number;
    level: number;
}

const props = withDefaults(defineProps<{
    data?: ITocItem[];
    className?: string;
}>(), {
    data: () => [],
    className: ''
});

const emit = defineEmits<{
    select: [item: ITocItem];
}>();

const selectedId = ref(-1);

function onSelect(item: ITocItem, index: number) {
    selectedId.value = index;
    emit('select', item);
}
</script>
