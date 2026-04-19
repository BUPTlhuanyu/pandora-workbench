<template>
    <span
        :data-key="nodeData.key"
        :data-context="nodeData.type"
        :style="{display: !inputShow ? 'unset' : 'none'}"
        class="ant-tree-title-text"
    >
        {{ title }}
    </span>
    <input
        ref="inputRef"
        :style="{display: inputShow ? 'unset' : 'none'}"
        class="ant-tree-title-search-input"
        @blur="onBlur"
        @keypress="onKeyPress"
    />
</template>

<script setup lang="ts">
import {ref, watch, nextTick} from 'vue';
import './title.less';

interface NodeData {
    title?: string;
    type?: string;
    key: string | number;
    path?: string;
    name?: string;
    exist?: boolean;
}

const props = withDefaults(defineProps<{
    nodeData: NodeData;
    rename?: boolean;
    onRename?: (oldPath: string, newName: string, nodeData: Record<string, any>) => Promise<any>;
}>(), {
    rename: false
});

const inputShow = ref(false);
const title = ref(props.nodeData.title || '');
const inputRef = ref<HTMLInputElement | null>(null);

watch(() => props.rename, (val) => {
    if (val) {
        inputShow.value = true;
        nextTick(() => {
            if (inputRef.value) {
                inputRef.value.value = typeof props.nodeData.title === 'string' ? props.nodeData.title : '';
                inputRef.value.focus();
            }
        });
    } else {
        inputShow.value = false;
    }
});

watch(() => props.nodeData.exist, (val) => {
    if (!val) {
        inputShow.value = true;
        setTimeout(() => {
            if (inputRef.value) {
                inputRef.value.value = typeof props.nodeData.title === 'string' ? props.nodeData.title : '';
                inputRef.value.focus();
            }
        }, 60);
    }
});

function handleRename() {
    const newName = inputRef.value?.value.trim();
    if (!newName) return;
    if (props.nodeData.path && typeof props.onRename === 'function') {
        props.onRename(props.nodeData.path, newName, props.nodeData)
            .then((res: string) => {
                title.value = res ? newName : (props.nodeData.title || '');
                inputShow.value = false;
            })
            .catch(err => console.log(err));
    }
}

function onKeyPress(e: KeyboardEvent) {
    if (e.key === 'Enter') {
        handleRename();
    }
}

function onBlur() {
    handleRename();
}
</script>
