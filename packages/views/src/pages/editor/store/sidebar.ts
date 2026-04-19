/**
 * @file 用于管理文件系统状态
 */
import {defineStore} from 'pinia';
import {ref} from 'vue';

export const useSidebarStore = defineStore('sidebar', () => {
    const sidebarOpened = ref(false);
    const selectedFilePath = ref('');

    function toggleSidebar() {
        sidebarOpened.value = !sidebarOpened.value;
    }

    function selectFile(filePath: string) {
        selectedFilePath.value = filePath;
    }

    return {sidebarOpened, selectedFilePath, toggleSidebar, selectFile};
});
