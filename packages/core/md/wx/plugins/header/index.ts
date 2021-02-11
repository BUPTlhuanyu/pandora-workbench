/**
 * @file
 */
import {getStyleStr} from '../../../utils';
import {themeColor} from '../../common/constant';

const HEAD_ONE: Record<string, any> = {
    openType: 'head1_open',
    closeType: 'head1_close',
    tag: 'span'
};

const HEAD_TWO: Record<string, any> = {
    openType: 'head2_open',
    closeType: 'head2_close',
    tag: 'span'
};

// 插入子节点
function createHeader1(TokenCtr: any) {
    let {openType, closeType, tag} = HEAD_ONE;
    // let arr = [];
    let tokenOpen = new TokenCtr(openType, tag, 1);
    let tokenClose = new TokenCtr(closeType, tag, -1);
    return [tokenOpen, tokenClose];
}

function createHeader2(TokenCtr: any) {
    let {openType, closeType, tag} = HEAD_TWO;
    // let arr = [];
    let tokenOpen = new TokenCtr(openType, tag, 1);
    let tokenClose = new TokenCtr(closeType, tag, -1);
    return [tokenOpen, tokenClose];
}

// 修改h标签样式
function addHeader1Style(token: any) {
    let header1Style = {
        margin: '32px 0 24px',
        position: 'relative',
        textAlign: 'center',
        fontSize: '2em',
        lineHeight: '1.2',
        fontWeight: 'bold',
        fontFamily: 'Optima-Regular'
    };
    let header1StyleStr = getStyleStr(header1Style);
    token.attrPush(['style', header1StyleStr]);
    return token;
}

function addHeader2Style(token: any) {
    let header1Style = {
        margin: '28px auto 20px',
        position: 'relative',
        fontSize: '1.5em',
        lineHeight: '1.2',
        fontWeight: 'bold',
        fontFamily: 'Optima-Regular'
    };
    let header1StyleStr = getStyleStr(header1Style);
    token.attrPush(['style', header1StyleStr]);
    return token;
}

function addHeader3Style(token: any) {
    let header2Style = {
        borderLeft: `2px solid ${themeColor}`,
        paddingLeft: '16px',
        margin: '24px auto 16px',
        fontSize: '1.2em',
        lineHeight: '1.2',
        fontWeight: 'bold',
        fontFamily: 'Optima-Regular'
    };
    let header2StyleStr = getStyleStr(header2Style);
    token.attrPush(['style', header2StyleStr]);
    return token;
}

function plugin() {
    return function (state: any) {
        let tokens = state.tokens;
        if (!Array.isArray(tokens)) {
            return;
        }
        let opening: boolean = false;
        let openType: string = '';
        let newTokens: any[] = [];
        tokens.reduce((prev, cur) => {
            if (opening && cur.type === 'inline') {
                switch (openType) {
                    case 'h1': {
                        let testToken = createHeader1(state.Token);
                        // cur.children = testToken;
                        testToken.splice(1, 0, cur);
                        prev.push(...testToken);
                        return prev;
                    }
                    case 'h2': {
                        let testToken = createHeader2(state.Token);
                        // cur.children = testToken;
                        testToken.splice(1, 0, cur);
                        prev.push(...testToken);
                        return prev;
                    }
                    case 'h3': {
                        break;
                    }
                    default: {
                        prev.push(cur);
                        return prev;
                    }
                }
            }
            if (cur.type === 'heading_open') {
                openType = cur.tag;
                opening = true;
                switch (cur.tag) {
                    case 'h1': {
                        let head1 = addHeader1Style(cur);
                        prev.push(head1);
                        return prev;
                    }
                    case 'h2': {
                        let head2 = addHeader2Style(cur);
                        prev.push(head2);
                        return prev;
                    }
                    case 'h3': {
                        let head3 = addHeader3Style(cur);
                        prev.push(head3);
                        return prev;
                    }
                    default:
                        break;
                }
            }
            else if (cur.type === 'heading_close') {
                openType = cur.tag;
                opening = false;
            }

            prev.push(cur);
            return prev;
        }, newTokens);
        state.tokens = newTokens;
    };
}

export default function (md: any) {
    md.renderer.rules[HEAD_ONE.openType] = function () {
        const style = {
            textAlign: 'center',
            display: 'inline-block',
            position: 'relative'
        };
        let styleStr = getStyleStr(style);
        return `<span style="${styleStr}">`;
    };
    md.renderer.rules[HEAD_ONE.closeType] = function () {
        const afterStyle = {
            position: 'absolute',
            left: '0',
            right: '0',
            margin: 'auto',
            width: '100px',
            bottom: '0',
            display: 'block',
            borderBottom: `2px dashed ${themeColor}`
        };
        let afterStyleStr = getStyleStr(afterStyle);
        return `</span><span style="${afterStyleStr}"></span>`;
    };
    md.renderer.rules[HEAD_TWO.openType] = function () {
        const style = {
            textAlign: 'center',
            display: 'inline-block',
            position: 'relative',
            padding: '0 10px',
            background: `linear-gradient(rgb(255, 255, 255) 60%, ${themeColor} 40%)`
        };
        let styleStr = getStyleStr(style);
        return `<span style="${styleStr}">`;
    };
    md.renderer.rules[HEAD_TWO.closeType] = function () {
        return '</span>';
    };
    md.core.ruler.push('wx', plugin());
}
