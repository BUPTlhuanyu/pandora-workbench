import {ref, watch, onMounted, type Ref} from 'vue';
import codemirror, {createCodemirror} from './code';

export interface CodemirrorObj {
    code: Ref<string>;
    editorRef: Ref<HTMLElement | null>;
    scroll: Ref<{
        scrollTop: number;
        scrollHeight: number;
        clientHeight: number;
    }>;
    editor: Ref<codemirror.Editor | null>;
    count: Ref<number>;
    setCode: (val: string) => void;
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
    const editorRef = ref<HTMLElement | null>(null);
    const code = ref('');
    const count = ref(0);
    const scroll = ref({
        scrollTop: 0,
        scrollHeight: 0,
        clientHeight: 0
    });
    const editor = ref<codemirror.Editor | null>(null);

    function updateScrollInfo(cm: codemirror.Editor | null) {
        if (cm) {
            const {clientHeight, height, top} = cm.getScrollInfo();
            scroll.value = {
                scrollTop: top,
                clientHeight,
                scrollHeight: height
            };
        }
    }

    function setCode(val: string) {
        code.value = val;
    }

    onMounted(() => {
        if (editorRef.value) {
            const cm = createCodemirror(editorRef.value);
            cm.on('change', () => {
                code.value = cm.getValue();
                count.value = wordCount(code.value);
            });
            cm.on('update', updateScrollInfo);
            cm.on('scroll', updateScrollInfo);
            editor.value = cm;
            updateScrollInfo(cm);
        }
    });

    return {code, setCode, editorRef, scroll, editor, count};
}
