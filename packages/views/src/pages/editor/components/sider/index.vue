<template>
    <div
        ref="siderRef"
        :class="['pandora-sider-wrapper', className]"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
    >
        <div class="pandora-sider-container" data-context="sider">
            <div class="sider-title">
                <span v-if="mouseEnter" class="sider-title-icon sider-title-list" title="大纲/列表" @click="onToc">
                    <Icon type="list" :style="{fontSize: '20px'}" />
                </span>
                <div class="sider-title-text">{{ showToc ? '大纲' : '文件' }}</div>
                <span v-if="mouseEnter" class="sider-title-icon sider-title-search" title="查找" @click="toggleShowPanel()">
                    <Icon type="search" :style="{fontSize: '20px'}" />
                </span>
            </div>

            <div v-if="showPanel" class="sider-panel">
                <SiderHeader :focused="showPanel" @press-enter="onStartSearch" @back="toggleShowPanel()" />
                <SearchList
                    v-if="searchResult.length > 0"
                    :data="searchResult"
                    class-name="sider-panel-content"
                    @select="changeSelectedFile"
                    @line-select="onLineSelect"
                />
                <div v-else class="sider-panel-empty">没有匹配结果</div>
            </div>

            <div v-if="showToc" class="sider-toc">
                <TocList v-if="tocList.length > 0" :data="tocList" @select="onTocSelect" />
                <div v-else class="sider-toc-empty">没有大纲</div>
            </div>

            <FileFolder
                v-if="treeData.length > 0"
                :class-name="`sider-file-folder ${showToc ? 'sider-file-folder-hide' : ''}`"
                :tree-data="treeData"
                :on-rename="onRename"
                :rename-key="renameKey"
                :selected-file-path="sidebarStore.selectedFilePath"
                @select="onSelect"
            />
            <div v-else class="sider-file-empty">没有打开的文件夹</div>

            <div v-if="mouseEnter && !showToc" class="sider-footer" @click="getTreeData">
                打开文件夹...
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {ref, watch, onMounted, onUnmounted} from 'vue';
import {produce} from 'immer';
import './index.less';

import FileFolder from 'views/src/components/file-folder/index.vue';
import type {ItreeData} from 'views/src/components/file-folder/index.vue';
import SearchList from 'views/src/components/search-list/index.vue';
import type {ISearchResult} from 'views/src/components/search-list/index.vue';
import TocList from 'views/src/components/toc-list/index.vue';
import type {ITocItem} from 'views/src/components/toc-list/index.vue';
import Icon from 'views/src/components/icon/index.vue';
import SiderHeader from 'views/src/pages/editor/components/sider/header/index.vue';

import {pandora} from 'views/src/services/pandora';
import {revealFileInOs, moveFileToTrash} from 'views/src/services/message-center';

import {FS_CREATE_FILE, FS_CREATE_DIR, FS_EDIT, FS_DELETE, fileEvent, FS_REVEAL} from 'views/src/utils/event';
import {isFilePath} from 'views/src/utils/tools';
import {getMdOutline} from 'views/src/utils/markdown-helper';
import {addToTreeData, deleteToTreeData, getRootPath, updateNodeData} from 'views/src/pages/editor/components/sider/utils';

import {useSidebarStore} from 'views/src/pages/editor/store/sidebar';
import {useEditorStore} from 'views/src/pages/editor/store/editor';
import {scrollToLine} from 'views/src/hooks/useCodemirror/code';

defineProps<{
    className?: string;
}>();

const sidebarStore = useSidebarStore();
const editorStore = useEditorStore();

const siderRef = ref<HTMLDivElement | null>(null);
const mouseEnter = ref(false);
const contextFlag = ref(false);
const showPanel = ref(false);
const showToc = ref(false);
const tocList = ref<ITocItem[]>([]);
const renameKey = ref('');
const treeData = ref<ItreeData>([]);
const searchResult = ref<ISearchResult[]>([]);

// Expose ref for parent
defineExpose({siderRef});

function toggleShowPanel(val?: boolean) {
    showPanel.value = typeof val === 'boolean' ? val : !showPanel.value;
}

function onMouseEnter() {
    if (!contextFlag.value) {
        mouseEnter.value = true;
    } else {
        contextFlag.value = false;
    }
}

function onMouseLeave() {
    if (!contextFlag.value) {
        mouseEnter.value = false;
    }
}

// Sidebar width
watch(() => sidebarStore.sidebarOpened, (opened) => {
    if (siderRef.value) {
        siderRef.value.style.width = opened ? '30%' : '0px';
    }
});

// Set data-context attribute
watch(treeData, (val) => {
    if (val && val.length > 0) {
        document.querySelector('.sider-file-folder')?.setAttribute('data-context', 'sider');
    }
});

function changeSelectedFile(filename: string) {
    sidebarStore.selectFile(filename);
}

function getTreeData() {
    if (!pandora) return;
    pandora.ipcRenderer.invoke('pandora:dialog').then((data: any) => {
        if (!data) return;
        treeData.value = [];
        treeData.value = data as ItreeData;
        changeSelectedFile(data[0].key);
    });
}

function onSelect(keys: (string | number)[], info: any) {
    const node = info?.node || info?.selectedNodes?.[0];
    const selectedFilePath = sidebarStore.selectedFilePath;
    if (isFilePath(selectedFilePath)) {
        const content = editorStore.editor?.getDoc().getValue() || '';
        pandora?.ipcRenderer
            .invoke('pandora:writeFile', selectedFilePath, content)
            .catch((err: any) => console.log(err));
    }
    changeSelectedFile(String(keys[0] || node?.path));
    if (String(keys[0]) !== renameKey.value) {
        renameKey.value = '';
    }
}

function createItem(type: 'file' | 'directory') {
    if (!treeData.value[0]) return;
    editorStore.editor?.getDoc().setValue('');
    let rootDir = sidebarStore.selectedFilePath || (treeData.value[0] as any).path;
    rootDir = getRootPath(rootDir);
    if (!rootDir) return;
    contextFlag.value = true;
    const {node, nextTree} = addToTreeData(treeData.value, rootDir, type);
    if (node.key && nextTree) {
        treeData.value = nextTree as any;
        setTimeout(() => {
            changeSelectedFile(node.key as string);
        }, 0);
    }
}

function registerFileEvents() {
    fileEvent.removeAllListeners(FS_REVEAL);
    fileEvent.on(FS_REVEAL, (path: string) => {
        revealFileInOs(path || sidebarStore.selectedFilePath);
    });
    fileEvent.removeAllListeners(FS_CREATE_FILE);
    fileEvent.on(FS_CREATE_FILE, () => createItem('file'));
    fileEvent.removeAllListeners(FS_CREATE_DIR);
    fileEvent.on(FS_CREATE_DIR, () => createItem('directory'));
    fileEvent.removeAllListeners(FS_DELETE);
    fileEvent.on(FS_DELETE, (path: string) => {
        path = path || sidebarStore.selectedFilePath;
        moveFileToTrash(path);
        const {selectedFile, nextTree} = deleteToTreeData(treeData.value, path);
        if (nextTree) {
            if (sidebarStore.selectedFilePath === path) {
                changeSelectedFile(selectedFile);
            }
            treeData.value = nextTree as any;
        }
    });
}

watch([treeData, () => sidebarStore.selectedFilePath], () => {
    registerFileEvents();
}, {immediate: true});

function fsRename(key: string) {
    changeSelectedFile(key);
    renameKey.value = key;
}

onMounted(() => {
    fileEvent.on(FS_EDIT, fsRename);
});

onUnmounted(() => {
    fileEvent.off(FS_EDIT, fsRename);
});

function immerTreeData(nodeKey: string, name: string) {
    if (treeData.value.length > 0) {
        treeData.value = produce(treeData.value, (draftTreeData: any) => {
            let root = draftTreeData[0];
            if (root) {
                let stack: Record<string, any>[] = [root];
                while (stack.length > 0) {
                    let node = stack.pop()!;
                    if (node.key === nodeKey) {
                        updateNodeData(node, name);
                        stack.length = 0;
                        break;
                    }
                    if (node.children && node.children.length > 0) {
                        for (let i = 0; i < node.children.length; i++) {
                            stack.push(node.children[i]);
                        }
                    }
                }
            }
        });
    }
}

function onRename(oldPath: string, newName: string, nodeData: Record<string, any>) {
    if (!pandora) return Promise.reject();
    const editor = editorStore.editor;
    if (nodeData.type === 'file') {
        const content = editor?.getDoc().getValue() || '';
        return pandora.ipcRenderer
            .invoke('pandora:renameFile', oldPath, newName, content)
            .then((res: any) => {
                if (res.success) {
                    changeSelectedFile(res.data);
                    immerTreeData(oldPath, newName);
                    return true;
                }
                return false;
            })
            .catch((err: any) => console.log(err));
    } else if (nodeData.type === 'directory') {
        return pandora.ipcRenderer
            .invoke('pandora:renameDir', oldPath, newName)
            .then((res: any) => {
                if (res.success) {
                    changeSelectedFile(res.data);
                    immerTreeData(oldPath, newName);
                    return true;
                }
                return false;
            })
            .catch((err: any) => console.log(err));
    }
    return Promise.reject();
}

function onToc() {
    const list = getMdOutline(editorStore.editor);
    tocList.value = list;
    showToc.value = !showToc.value;
}

function onTocSelect(item: ITocItem) {
    scrollToLine(editorStore.editor, item.line);
}

function onLineSelect(line: number, _: string, filename: string) {
    try {
        if (filename !== sidebarStore.selectedFilePath) {
            changeSelectedFile(filename);
            setTimeout(() => {
                scrollToLine(editorStore.editor, line);
            }, 200);
        } else {
            scrollToLine(editorStore.editor, line);
        }
    } catch (e) {}
}

function onStartSearch(value: string, caseSensitive: boolean, wholeWord: boolean) {
    if (!value) {
        searchResult.value = [];
    } else if (treeData.value[0]) {
        pandora?.ipcRenderer
            .invoke('pandora:fileSearch', (treeData.value[0] as any).path, {value, caseSensitive, wholeWord})
            .then((data: any) => {
                if (data.status === 0) {
                    searchResult.value = data.data;
                }
            });
    }
    toggleShowPanel(true);
}
</script>
