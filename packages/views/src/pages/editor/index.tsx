import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import Editor from './editor';
import EditorStore from './store';

// TODO: 去耦合
import {registerContextMenu, registerTopMenuListener} from 'views/src/services/menu/electron';

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
