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
}

export default function useCodemirror(): CodemirrorObj {
    const isMounted = useRef(false);
    const [ele, setCodemirrorEle] = useState<Element | null>(null);
    const [code, setCode] = useState<string>('');
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
                setCode(editor.getValue());
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

    return {code, setCodemirrorEle, scroll, editor};
}
