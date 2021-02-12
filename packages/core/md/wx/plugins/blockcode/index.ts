/**
 * @file
 */
import {getStyleStr, highlight} from '../../../utils';
import {classMap, classPrefix} from './class2style';

/**
 * 渲染特定type的token节点时，该函数返回的字符串将作为dom结构来处理，这里注意xss
 * @param tokens token节点
 * @param index 需要修改的token的位置
 */
function codeHandler(tokens: any, index: number) {
    const codeBeforeStyle = {
        display: 'flex',
        position: 'relative',
        height: '30px',
        marginBottom: '-5px',
        borderTopLeftRadius: '5px',
        borderTopRightRadius: '5px',
        background: '#253238',
        paddingLeft: '8px',
        boxSizing: 'border-box',
        justifyContent: 'start',
        alignItems: 'center'
    };
    const codeBeforeStyleStr = getStyleStr(codeBeforeStyle);
    const codePreStyle = {
        fontSize: 0,
        margin: '10px 4px',
        borderRadius: '5px',
        boxShadow: 'rgba(0, 0, 0, 0.55) 0px 1px 5px'
    };
    const codePreStyleStr = getStyleStr(codePreStyle);
    const codeStyle = {
        overflowX: 'auto',
        padding: '16px',
        color: '#abb2bf',
        display: 'block',
        fontSize: '12px',
        WebkitOverflowScrolling: 'touch',
        paddingTop: '15px',
        background: '#253238',
        borderBottomRightRadius: '5px',
        borderBottomLeftRadius: '5px',
        boxSizing: 'border-box',
        margin: 0
    };
    const codeStyleStr = getStyleStr(codeStyle);
    const svgStyle = {
        position: 'absolute',
        left: '8px',
        top: '9px'
    };
    const svgStyleStr = getStyleStr(svgStyle);
    let codeContent = highlight(tokens[index].content, {lang: 'javascript', classPrefix});
    if (!Array.isArray(codeContent)) {
        codeContent = codeContent.replace(/\&amp;(lt;|gt;)/g, '&$1');
        // 替换class名称为style
        Object.entries(classMap).forEach(([key, value]: any[]) => {
            let keyReg = new RegExp(`(<.*)(class="${key}")(.*>)`, 'g');
            codeContent = (codeContent as string).replace(keyReg, `$1style="${value}"$3`);
        });
    }
    return `<pre style="${codePreStyleStr}">
        <span style="${codeBeforeStyleStr}">
            <svg style="${svgStyleStr}" xmlns="http://www.w3.org/2000/svg" width="54" height="14" viewBox="0 0 54 14">
                <g fill="none" fill-rule="evenodd" transform="translate(1 1)">
                    <circle cx="6" cy="6" r="6" fill="#FF5F56" stroke="#E0443E" stroke-width=".5"></circle>
                    <circle cx="26" cy="6" r="6" fill="#FFBD2E" stroke="#DEA123" stroke-width=".5"></circle>
                    <circle cx="46" cy="6" r="6" fill="#27C93F" stroke="#1AAB29" stroke-width=".5"></circle>
                </g>
            </svg>
        </span>
        <code style="${codeStyleStr}">${codeContent}</code>
    </pre>`;
}

export default function (md: any) {
    // 处理 ``` 的代码块
    md.renderer.rules.fence = codeHandler;
    // 处理 tab 触发的代码块
    md.renderer.rules.code_block = codeHandler;
    return md;
}
