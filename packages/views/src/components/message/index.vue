<template>
    <div>
        <template v-if="list.length > 0">
            <div
                v-for="item in list"
                :key="item.key"
                class="pandora-message-wrapper pandora-message-animation-begin"
            >
                {{ item.message.text }}
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue';
import './index.less';

export interface MessageOptions {
    text: string;
    type?: string;
    duration?: number;
    key?: string;
}

const props = defineProps<{
    message: MessageOptions | null;
}>();

interface ListItem {
    message: MessageOptions;
    deadTime: number;
    key: string;
}

let fakeKey = 0;
const defaultDuration = 800;
const list = ref<ListItem[]>([]);
let maxDuration = defaultDuration * 2;
let timer: ReturnType<typeof setTimeout> | null = null;

function cleanExpired() {
    const curTime = Date.now();
    list.value = list.value.filter(item => item.deadTime > curTime);
}

watch(() => props.message, (msg) => {
    if (!msg) return;
    const curTime = Date.now();
    if (msg.duration !== undefined && msg.duration > maxDuration) {
        maxDuration = msg.duration + 100;
    }
    const key = msg.key === undefined ? `${++fakeKey}` : msg.key;
    cleanExpired();
    list.value.push({
        message: msg,
        deadTime: msg.duration ? msg.duration + curTime : defaultDuration + curTime,
        key
    });
    if (timer) {
        clearTimeout(timer);
    }
    timer = setTimeout(() => {
        cleanExpired();
    }, maxDuration);
});
</script>
