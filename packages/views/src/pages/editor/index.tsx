import React from 'react';
import {createRoot} from 'react-dom/client';
import './index.less';
import Editor from './editor';
import EditorStore from './store';

// TODO: 去耦合
import {registerContextMenu, registerTopMenuListener} from 'views/src/services/menu/electron';

const root = createRoot(document.getElementById('root')!);
root.render(
    <React.StrictMode>
        <EditorStore>
            <Editor />
        </EditorStore>
    </React.StrictMode>
);

// 设置electron上下文菜单
registerContextMenu();
// 设置顶部菜单监听
registerTopMenuListener();
