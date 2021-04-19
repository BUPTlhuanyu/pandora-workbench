import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import Editor from './pages/editor';
import reportWebVitals from './reportWebVitals';
import EditorStore from './pages/editor/editor-store';

ReactDOM.render(
    <React.StrictMode>
        <EditorStore>
            <Editor />
        </EditorStore>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();