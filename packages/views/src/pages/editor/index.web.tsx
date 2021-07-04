import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import Editor from './editor';
import EditorStore from './store';

ReactDOM.render(
    <React.StrictMode>
        <EditorStore>
            <Editor />
        </EditorStore>
    </React.StrictMode>,
    document.getElementById('root')
);
