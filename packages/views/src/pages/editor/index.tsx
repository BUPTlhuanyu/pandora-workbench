import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import Editor from './editor';
import EditorStore from './store';

import {registerContextMenu, registerTopMenuListener} from 'views/src/electron/menu';

ReactDOM.render(
    <React.StrictMode>
        <EditorStore>
            <Editor />
        </EditorStore>
    </React.StrictMode>,
    document.getElementById('root')
);

// 设置electron上下文菜单
registerContextMenu();
// 设置顶部菜单监听
registerTopMenuListener();
