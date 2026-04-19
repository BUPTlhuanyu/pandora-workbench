<template>
    <div class="sider-panel-header" :class="className">
        <span class="sider-panel-header-icon sider-panel-header-back" @click="$emit('back')">
            <Icon type="left" :style="{fontSize: '20px'}" />
        </span>
        <a-input
            ref="inputRef"
            placeholder="查找"
            class="sider-panel-header-input"
            @press-enter="onPressEnter"
        >
            <template #suffix>
                <span
                    title="区分大小写"
                    :class="['sider-panel-header-icon', caseSensitive ? 'sider-panel-header-input-selected' : '']"
                    @click="caseSensitive = !caseSensitive"
                >
                    <Icon type="case" :style="{fontSize: '20px'}" />
                </span>
                <span
                    title="查找整个单词"
                    :class="['sider-panel-header-icon', wholeWord ? 'sider-panel-header-input-selected' : '']"
                    @click="wholeWord = !wholeWord"
                >
                    <Icon type="word" :style="{fontSize: '20px'}" />
                </span>
            </template>
        </a-input>
    </div>
</template>

<script setup lang="ts">
import {ref, watch, nextTick} from 'vue';
import './index.less';
import Icon from 'views/src/components/icon/index.vue';

const props = withDefaults(defineProps<{
    className?: string;
    focused?: boolean;
}>(), {
    className: '',
    focused: false
});

const emit = defineEmits<{
    back: [];
    pressEnter: [value: string, caseSensitive: boolean, wholeWord: boolean];
}>();

const caseSensitive = ref(false);
const wholeWord = ref(false);
const inputRef = ref<any>(null);

watch(() => props.focused, (val) => {
    if (val) {
        nextTick(() => {
            inputRef.value?.focus?.();
        });
    }
});

function onPressEnter(e: any) {
    const value = e?.target?.value;
    if (!value) return;
    emit('pressEnter', value, caseSensitive.value, wholeWord.value);
}
</script>
