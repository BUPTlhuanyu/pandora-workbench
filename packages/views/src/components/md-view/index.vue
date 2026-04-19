<template>
    <div :class="className" v-html="mdString"></div>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue';
import {getMd} from 'core/md';
import './index.less';

const props = withDefaults(defineProps<{
    className?: string;
    value?: string;
}>(), {
    className: '',
    value: ''
});

const md = getMd('wx', {html: true});
const mdString = ref('');

watch(() => props.value, (val) => {
    mdString.value = md.render(val);
}, {immediate: true});
</script>
