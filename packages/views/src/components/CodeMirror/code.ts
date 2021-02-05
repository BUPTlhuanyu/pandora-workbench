import codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/markdown/markdown.js';

codemirror.defineOption('placeholder', '', function (cm: any, val: any, old: any) {
    var prev = old && old !== (codemirror as any).Init;
    if (val && !prev) {
        cm.on('blur', onBlur);
        cm.on('change', onChange);
        cm.on('swapDoc', onChange);
        codemirror.on(
            cm.getInputField(),
            'compositionupdate',
            (cm.state.placeholderCompose = function () {
                onComposition(cm);
            })
        );
        onChange(cm);
    } else if (!val && prev) {
        cm.off('blur', onBlur);
        cm.off('change', onChange);
        cm.off('swapDoc', onChange);
        codemirror.off(cm.getInputField(), 'compositionupdate', cm.state.placeholderCompose);
        clearPlaceholder(cm);
        var wrapper = cm.getWrapperElement();
        wrapper.className = wrapper.className.replace(' codemirror-empty', '');
    }

    if (val && !cm.hasFocus()) {
        onBlur(cm);
    }
});

function clearPlaceholder(cm: any) {
    if (cm.state.placeholder) {
        cm.state.placeholder.parentNode.removeChild(cm.state.placeholder);
        cm.state.placeholder = null;
    }
}
function setPlaceholder(cm: any) {
    clearPlaceholder(cm);
    var elt = (cm.state.placeholder = document.createElement('p'));
    elt.style.cssText = 'height: 0; overflow: visible';
    elt.style.direction = cm.getOption('direction');
    elt.className = 'CodeMirror-placeholder CodeMirror-line-like';
    var placeHolder = cm.getOption('placeholder');
    if (typeof placeHolder === 'string') {
        placeHolder = document.createTextNode(placeHolder);
    }
    elt.appendChild(placeHolder);
    cm.display.lineSpace.insertBefore(elt, cm.display.lineSpace.firstChild);
}

function onComposition(cm: any) {
    setTimeout(function () {
        var empty = false;
        if (cm.lineCount() === 1) {
            var input = cm.getInputField();
            empty = input.nodeName === 'TEXTAREA'
                ? !cm.getLine(0).length
                : !/[^\u200b]/.test(input.querySelector('.CodeMirror-line').textContent);
        }
        if (empty) {
            setPlaceholder(cm);
        }
        else {
            clearPlaceholder(cm);
        }
    }, 20);
}

function onBlur(cm: any) {
    if (isEmpty(cm)) {
        setPlaceholder(cm);
    }
}
function onChange(cm: any) {
    var wrapper = cm.getWrapperElement();
    var empty = isEmpty(cm);
    wrapper.className = wrapper.className.replace(' CodeMirror-empty', '') + (empty ? ' CodeMirror-empty' : '');

    if (empty) {
        setPlaceholder(cm);
    }
    else {
        clearPlaceholder(cm);
    }
}

function isEmpty(cm: any) {
    return cm.lineCount() === 1 && cm.getLine(0) === '';
}

export default function (ele: any) {
    return codemirror(ele, {
        value: '',
        mode: 'markdown',
        // theme: , // class="CodeMirror cm-s-${theme}" 自定义样式
        indentUnit: 4, // 换行的时候缩进几个字符，默认为2个
        // smartIndent: true, // 默认为true，表示根据语言决定换行缩进多少字符
        tabSize: 4, // 一次缩进几个字符
        // indentWithTabs: false,
        // electricChars: true,
        // specialChars: RegExp, // 检测特殊字符
        // specialCharPlaceholder: function(char): Element, // 检测到的特殊字符替换成dom
        // direction: "ltr" | "rtl", // 从左到有输入还是从右到左
        // rtlMoveVisually: false,
        // keyMap: 'default',
        // extraKeys: object,
        // configureMouse: fn,
        // lineWrapping: false,
        lineNumbers: true,
        firstLineNumber: 1,
        // lineNumberFormatter: num => `custom-${num}`, // 行数改成自定义字符
        // gutters: [{className: 'fffff', style: 'width: 100px'}], // 数字左侧的gutter样式与类名
        fixedGutter: true, // gutter 是否 fixed，
        lineWiseCopyCut: false,
        pollInterval: 100 // 检测多久捕获一下onchange
    });
}
