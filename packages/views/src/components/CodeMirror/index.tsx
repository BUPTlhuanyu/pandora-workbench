import React, {useRef} from 'react';
import codemirror from './code';
import {useMount} from 'ahooks';

export default function Codemirror() {
    const editorRef: React.RefObject<HTMLDivElement> = useRef(null);
    useMount(() => {
        let ele = editorRef.current;
        console.log(editorRef);
        let editor = codemirror(ele);
        editor.on('change', (...args) => {
            console.log('change', args);
            console.log('value', editor.getValue());
        });
        editor.on('inputRead', (...args) => {
            console.log('inputRead', args);
        });
        editor.on('viewportChange', (...args) => {
            console.log('viewportChange', args);
        });
        editor.on('blur', (...args) => {
            console.log('blur', args);
        });
        editor.on('focus', (...args) => {
            console.log('focus', args);
        });
        editor.on('renderLine', (...args) => {
            console.log('renderLine', args);
        });
        editor.on('changes', (...args) => {
            console.log('changes', args);
            let ins: any = args[0];
            ins.doc.addLineClass(0, 'wrap', 'custom-lhy');
            let dom = document.createElement('span');
            dom.textContent = 'hhh';
            ins.doc.markText(
                {line: 0},
                {line: 1},
                {
                    className: 'fffff',
                    replacedWith: dom
                }
            );
            // let dom = document.createElement('h1');
            // dom.textContent = 'hhh';
            // ins.doc.setBookmark(
            //     {line: 0},
            //     {
            //         widget: dom,
            //         handleMouseEvents: true
            //     }
            // );
        });
        editor.on('beforeChange', (...args) => {
            console.log('beforeChange', args);
            let ins: any = args[0];
            console.log(ins.doc.getLineHandle(0));
            // let dom = document.createElement('h1');
            // dom.textContent = 'hhh';
            // ins.doc.addLineWidget(0, dom);
        });

        // editor.on('blur', (...args) => {
        //     console.log('blur', args);
        // });
        // editor.on('blur', (...args) => {
        //     console.log('blur', args);
        // });
    });
    return <div ref={editorRef}>code</div>;
}
