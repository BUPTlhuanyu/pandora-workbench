<template>
    <div class="pandora-editor">
        <Sider v-if="pandora" class-name="editor-file-folder" ref="siderComp" />
        <div class="editor-container">
            <ToolBar />
            <div class="editor-wrapper">
                <div class="editor-split-pane" style="position: relative">
                    <div
                        class="md-editor-wrapper"
                        style="height: 100%; overflow: auto; flex: 1"
                        @mouseover="scrollTarget = 0"
                    >
                        <div ref="editorRef" class="md-editor-container"></div>
                    </div>
                    <div class="md-view-wrapper" style="flex: 1">
                        <div ref="mdRef" class="md-view-layer" @mouseover="scrollTarget = 1">
                            <MdView :value="code" class-name="md-view-container" />
                        </div>
                        <div class="iphone-frame"></div>
                    </div>
                </div>
            </div>
            <EditorFooter :count="count" />
        </div>
    </div>
</template>

<script setup lang="ts">
import {ref, watch, onMounted, onUnmounted} from 'vue';
import './editor.less';
import useCodemirror from 'views/src/hooks/useCodemirror';
import {useSidebarStore} from './store/sidebar';
import {useEditorStore} from './store/editor';

import Sider from './components/sider/index.vue';
import MdView from 'views/src/components/md-view/index.vue';
import ToolBar from './components/tool-bar/index.vue';
import EditorFooter from './components/footer/index.vue';

import {success, error} from 'views/src/utils/message';
import {isFilePath} from 'views/src/utils/tools';
import {fileEvent, FS_SAVE} from 'views/src/utils/event';
import {pandora} from 'views/src/services/pandora';

import {blobToBase64, getFileName} from 'shared/utils/img';
import {uploader} from 'shared/utils/chunk';
import {PROTOCOL_IMG} from 'shared/common/constant';

const sidebarStore = useSidebarStore();
const editorStore = useEditorStore();

const {code, setCode, editorRef, scroll: coScroll, editor, count} = useCodemirror();

const siderComp = ref<any>(null);
const mdRef = ref<HTMLDivElement | null>(null);
const scrollTarget = ref(0);
const mdScroll = ref({scrollTop: 0, scrollHeight: 0});

// Store editor instance in pinia
watch(editor, (cm) => {
    editorStore.storeEditor(cm as any);
    if (cm) {
        // @ts-ignore
        cm.on('paste', (_instance: any, e: ClipboardEvent) => {
            if (e.clipboardData?.items) {
                const items = e.clipboardData.items;
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    if (item.kind !== 'file') return;
                    const pasteFile = item.getAsFile();
                    if (!pasteFile) return;
                    if (pasteFile.size > 0 && pasteFile.type.match('^image/')) {
                        blobToBase64(pasteFile).then(data => {
                            const imageName = getFileName();
                            uploader({
                                send(data: any) {
                                    pandora.ipcRenderer.invoke('pandora:storeImage', {
                                        name: imageName,
                                        base64: data
                                    }).then((res: {success: boolean; data: string}) => {
                                        const doc = cm.getDoc();
                                        const curs = doc.getCursor();
                                        doc.replaceRange(
                                            `<img src="${PROTOCOL_IMG}:\/\/${res.data}" width="100%" height="100%" />`,
                                            {line: curs.line, ch: curs.ch}
                                        );
                                    }).catch((err: any) => console.warn(err));
                                }
                            }, data as string);
                        }).catch((e: any) => console.log(e));
                    }
                    return;
                }
            }
        });
    }
});

// Sidebar width
watch(() => sidebarStore.sidebarOpened, (opened) => {
    const el = siderComp.value?.siderRef;
    if (el) {
        el.style.width = opened ? '30%' : '0px';
    }
});

// Read file when selected file changes
watch(() => sidebarStore.selectedFilePath, (filePath) => {
    if (isFilePath(filePath) && pandora) {
        pandora.ipcRenderer.invoke('pandora:readFile', filePath).then((resStr: string) => {
            setCode(resStr);
            editor.value?.getDoc().setValue(resStr);
        }).catch((err: any) => console.warn(err));
    } else {
        setCode('');
        editor.value?.getDoc().setValue('');
    }
});

// Save file
function saveFileCb() {
    const content = editor.value?.getDoc().getValue() || '';
    if (!sidebarStore.selectedFilePath) {
        error('保存文件失败');
        return;
    }
    pandora?.ipcRenderer.invoke('pandora:writeFile', sidebarStore.selectedFilePath, content).then(() => {
        success('保存文件成功');
    }).catch((err: any) => console.log(err));
}

watch(() => sidebarStore.selectedFilePath, () => {
    fileEvent.removeAllListeners(FS_SAVE);
    fileEvent.on(FS_SAVE, saveFileCb);
}, {immediate: true});

// Scroll sync
function mdScrollHandler(evt: Event) {
    const target = evt.target as HTMLElement;
    mdScroll.value = {
        scrollTop: target.scrollTop,
        scrollHeight: target.scrollHeight
    };
}

onMounted(() => {
    const ele = mdRef.value;
    if (ele) {
        ele.addEventListener('scroll', mdScrollHandler);
    }
});

onUnmounted(() => {
    mdRef.value?.removeEventListener('scroll', mdScrollHandler);
});

// Bidirectional scroll sync
watch([coScroll, mdScroll], () => {
    const layerDom = mdRef.value;
    if (!layerDom || !editor.value) return;
    const mdScrollHeight = layerDom.scrollHeight - layerDom.clientHeight;
    const coScrollHeight = coScroll.value.scrollHeight - coScroll.value.clientHeight;
    if (mdScrollHeight <= 0 || coScrollHeight <= 0) return;

    if (scrollTarget.value === 1) {
        const coScrollTop = mdScroll.value.scrollTop / mdScrollHeight * coScrollHeight;
        editor.value.scrollTo(null, coScrollTop);
    } else {
        const mdScrollTop = coScroll.value.scrollTop / coScrollHeight * mdScrollHeight;
        layerDom.scrollTo(0, mdScrollTop);
    }
});
</script>
