<template>
    <div :class="`${prefix}`">
        <span>Toolkits</span>
        <div :class="`${prefix}-box`">
            <div :class="`${prefix}-box-item`" @click="edEditor">
                <div :class="`${prefix}-box-item-img`"></div>
                <div :class="`${prefix}-box-item-info`">
                    Make wechart article easy!
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import './index.less';
import {pandora} from 'views/src/services/pandora';

const prefix = 'pandora-home-content';

function edEditor() {
    pandora.ipcRenderer.invoke('pandora:mdEditor').then((resStr: string) => {
        console.log(resStr);
    }).catch((err: any) => {
        console.warn(err);
    });
}
</script>
