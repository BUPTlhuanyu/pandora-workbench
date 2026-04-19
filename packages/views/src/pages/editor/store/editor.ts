/**
 * @file 用于管理编辑器状态
 */
import {defineStore} from 'pinia';
import {ref} from 'vue';

export const useEditorStore = defineStore('editor', () => {
    const editor = ref<Record<string, any> | null>(null);

    function storeEditor(instance: Record<string, any> | null) {
        editor.value = instance;
    }

    return {editor, storeEditor};
});
