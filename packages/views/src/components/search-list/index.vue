<template>
    <div :class="['search-wrapper', className]">
        <div
            v-for="item in data"
            :key="item.filename"
            class="search-item"
            @click="$emit('select', item.filename)"
        >
            <div class="search-header">
                <span class="search-prefix" @click.stop="toggleItem(item.filename)">
                    <Icon
                        type="down"
                        :style="{
                            fontSize: '14px',
                            transform: expandedMap[item.filename] !== false ? 'rotate(0)' : 'rotate(-90deg)'
                        }"
                    />
                </span>
                <span class="search-title">{{ item.filename }}</span>
                <span class="search-count">{{ item.times }}</span>
            </div>
            <div
                v-show="expandedMap[item.filename] !== false"
                class="search-content"
            >
                <div
                    v-for="(lineItem, index) in item.list"
                    :key="`search-${index}`"
                    class="search-content-item"
                    v-html="lineItem.text"
                    @click.stop="$emit('lineSelect', lineItem.line, lineItem.text, item.filename)"
                ></div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {reactive} from 'vue';
import Icon from 'views/src/components/icon/index.vue';
import './index.less';

export interface ISearchResult {
    filename: string;
    list: Array<{line: number; text: string}>;
    times: number;
}

withDefaults(defineProps<{
    data?: ISearchResult[];
    className?: string;
}>(), {
    data: () => [],
    className: ''
});

defineEmits<{
    select: [filename: string];
    lineSelect: [line: number, htmlContent: string, filename: string];
}>();

const expandedMap = reactive<Record<string, boolean>>({});

function toggleItem(filename: string) {
    expandedMap[filename] = expandedMap[filename] === false ? true : false;
}
</script>
