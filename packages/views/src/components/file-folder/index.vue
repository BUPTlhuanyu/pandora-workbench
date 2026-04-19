<template>
    <a-directory-tree
        :class="className"
        multiple
        :selected-keys="[selectedFilePath]"
        :tree-data="treeData"
        @select="onSelect"
        @expand="onExpand"
    >
        <template #title="nodeData">
            <Title
                :node-data="nodeData"
                :rename="renameKey === nodeData.key && selectedFilePath === renameKey"
                :on-rename="onRename"
            />
        </template>
    </a-directory-tree>
</template>

<script setup lang="ts">
import Title from './title.vue';

export interface IFileData {
    title: string;
    key: string | number;
    isLeaf: boolean;
    exist?: boolean;
    path?: string;
    [key: string]: any;
}
export interface IDirData {
    title: string;
    exist?: boolean;
    key: string | number;
    path?: string;
    children: IFileData[] | IDirData[];
    [key: string]: any;
}
export type ItreeData = Array<IDirData | IFileData> | [];

withDefaults(defineProps<{
    className?: string;
    treeData?: ItreeData;
    selectedFilePath?: string;
    renameKey?: string;
    onRename?: (oldPath: string, newName: string, nodeData: Record<string, any>) => Promise<any>;
}>(), {
    className: '',
    treeData: () => [],
    selectedFilePath: '',
    renameKey: ''
});

const emit = defineEmits<{
    select: [selectedKeys: (string | number)[], info: any];
    expand: [expandedKeys: (string | number)[], info: any];
}>();

function onSelect(selectedKeys: (string | number)[], info: any) {
    emit('select', selectedKeys, info);
}

function onExpand(expandedKeys: (string | number)[], info: any) {
    emit('expand', expandedKeys, info);
}
</script>
