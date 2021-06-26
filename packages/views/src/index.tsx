import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import Editor from './pages/editor';
import reportWebVitals from './reportWebVitals';
import EditorStore from './pages/editor/store';

import {registerContextMenu, registerTopMenuListener} from './electron/menu';

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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
