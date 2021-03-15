import React, {useState, useEffect, useRef} from 'react';
import codemirror, {createCodemirror} from './code';

interface CodemirrorObj {
    code: string;
    setCodemirrorEle: React.Dispatch<React.SetStateAction<Element | null>>;
    scroll: {
        scrollTop: number;
        scrollHeight: number;
    };
    editor: codemirror.Editor | null;
    count: number;
    setCode: React.Dispatch<React.SetStateAction<string>>;
}

function wordCount(data: string) {
    // eslint-disable-next-line
    const pattern = /[a-zA-Z0-9_\u0392-\u03c9\u0410-\u04F9]+|[\u4E00-\u9FFF\u3400-\u4dbf\uf900-\ufaff\u3040-\u309f\uac00-\ud7af]/g;
    const m = data.match(pattern);
    let count = 0;
    if (m === null) {
        return count;
    }
    for (let item of m) {
        if (item.charCodeAt(0) >= 0x4E00) {
            count += item.length;
        }
        else {
            count += 1;
        }
    }
    return count;
}

export default function useCodemirror(): CodemirrorObj {
    const isMounted = useRef(false);
    const [ele, setCodemirrorEle] = useState<Element | null>(null);
    const [code, setCode] = useState<string>('');
    const [count, setCount] = useState<number>(0);
    const [scroll, setScroll] = useState<any>({
        scrollTop: 0,
        scrollHeight: 0
    });
    const [editor, setEditor] = useState<codemirror.Editor | null>(null);
    useEffect(() => {
        if (!isMounted.current || !ele) {
            isMounted.current = true;
        }
        else {
            let editor = createCodemirror(ele);
            editor.on('change', () => {
                let code = editor.getValue();
                let count = wordCount(code);
                setCode(code);
                setCount(count);
            });
            editor.on('scroll', (editor: any) => {
                let scrollTop = editor.doc.scrollTop;
                let docHeight = editor.doc.height;
                setScroll({
                    scrollTop,
                    scrollHeight: docHeight
                });
            });
            setEditor(editor);
        }
    }, [ele]);

    return {code, setCode, setCodemirrorEle, scroll, editor, count};
}
