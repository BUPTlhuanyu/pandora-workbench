<template>
    <div class="tool-bar-wrapper">
        <div class="tool-bar-content">
            <div class="tool-bar-title">Pandora Markdown</div>
            <div class="tool-bar-icon-group">
                <div ref="copyBtn" class="tool-bar-icon" title="复制">
                    <Icon type="copy" :style="{fontSize: '20px'}" />
                </div>
                <div v-if="pandora" class="tool-bar-icon" title="side bar" @click="toggleSidebar">
                    <Icon type="sideBar" :style="{fontSize: '20px'}" />
                </div>
                <div v-if="pandora" class="tool-bar-icon" title="save" @click="saveFile">
                    <Icon type="save" :style="{fontSize: '20px'}" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue';
import './index.less';
import ClipboardJS from 'clipboard-web';
import Icon from 'views/src/components/icon/index.vue';
import {fileEvent, FS_SAVE} from 'views/src/utils/event';
import {success, error} from 'views/src/utils/message';
import {pandora} from 'views/src/services/pandora';
import {useSidebarStore} from 'views/src/pages/editor/store/sidebar';

const sidebarStore = useSidebarStore();
const copyBtn = ref<HTMLDivElement | null>(null);

onMounted(() => {
    if (copyBtn.value) {
        const cpIns = new ClipboardJS(copyBtn.value, {
            target: () => document.querySelector('.md-view-wrapper') as HTMLDivElement
        });
        cpIns.on('success', success.bind(null, '复制成功'));
        cpIns.on('error', error.bind(null, '复制失败'));
    }
});

function toggleSidebar() {
    sidebarStore.toggleSidebar();
}

function saveFile() {
    fileEvent.emit(FS_SAVE);
}
</script>
