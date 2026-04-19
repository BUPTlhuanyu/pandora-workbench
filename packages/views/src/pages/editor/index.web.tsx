import React from 'react';
import {createRoot} from 'react-dom/client';
import './index.less';
import Editor from './editor';
import EditorStore from './store';

const root = createRoot(document.getElementById('root')!);
root.render(
    <React.StrictMode>
        <EditorStore>
            <Editor />
        </EditorStore>
    </React.StrictMode>
);
