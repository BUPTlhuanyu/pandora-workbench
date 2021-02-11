/**
 * @file
 */
// const themeColor = '#ffb11b';

const themeColor = '#f22f27';
const grayColor = '#8c8c8c';

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

const BLOCK_QUOTE: Record<string, any> = {
    type: 'block_before',
    tag: 'span'
};

function getStyleStr(style: Record<string, any>) {
    return Object.entries(style).reduce((prev: string, cur: [string, string]) => {
        let key = cur[0];
        let value = cur[1];
        let kebabCaseKey: string = key.replace(/([A-Z])/g, (up: string) => {
            return `-${up.toLowerCase()}`;
        });
        return prev + `${kebabCaseKey}: ${value};`;
    }, '');
}

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

function createBlockQuoteBefore(TokenCtr: any) {
    let {type, tag} = BLOCK_QUOTE;
    // let arr = [];
    let tokenBefore = new TokenCtr(type, tag, 1);
    return tokenBefore;
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

function addBlockQuoteStyle(token: any) {
    let quoteStyle = {
        background: 'rgb(255, 245, 227)',
        position: 'relative',
        padding: '24px 16px 12px',
        margin: '24px 0 36px',
        fontSize: '14px',
        lineHeight: 1,
        color: grayColor,
        textIndent: 0,
        border: 'none',
        borderLeft: `2px solid ${themeColor}`,
        letterSpacing: '1px'
    };
    let quoteStyleStr = getStyleStr(quoteStyle);
    token.attrPush(['style', quoteStyleStr]);
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
            if (cur.tag === 'p') {
                cur.attrPush(['style', 'line-height: 1.8']);
            }
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
            // cur.attrs = [['class', 'test-head']];
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
            else if (cur.type === 'blockquote_open') {
                openType = cur.tag;
                opening = true;
                let blockquote = addBlockQuoteStyle(cur);
                prev.push(blockquote);
                return prev;
            }
            else if (cur.type === 'blockquote_close') {
                openType = cur.tag;
                opening = false;
            }
            else if (opening && cur.type === 'paragraph_open') {
                let paragraphInBlockQuoteStyle = {
                    margin: '0',
                    lineHeight: '1.5'
                };
                let paragraphInBlockQuoteStyleStr = getStyleStr(paragraphInBlockQuoteStyle);
                cur.attrPush(['style', paragraphInBlockQuoteStyleStr]);
                let tokenBefore = createBlockQuoteBefore(state.Token);
                prev.push(tokenBefore, cur);
                return prev;
            }

            prev.push(cur);
            return prev;
        }, newTokens);
        state.tokens = newTokens;
    };
}

function codeHandler(tokens: any, index: number) {
    const codeBeforeStyle = {
        display: 'flex',
        position: 'relative',
        height: '30px',
        marginBottom: '-10px',
        borderRadius: '5px',
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
        display: '-webkit-box',
        fontSize: '12px',
        WebkitOverflowScrolling: 'touch',
        paddingTop: '15px',
        background: '#253238',
        borderRadius: '5px',
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
    const codeContent = tokens[index].content.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
    md.renderer.rules[BLOCK_QUOTE.type] = function () {
        const style = {
            position: 'absolute',
            top: '0',
            left: '12px',
            fontSize: '2em',
            fontWeight: '700',
            lineHeight: '1em',
            fontFamily: 'Arial, serif',
            color: themeColor
        };
        let styleStr = getStyleStr(style);
        return `<span style="${styleStr}">“</span>`;
    };
    md.renderer.rules.fence = codeHandler;
    md.renderer.rules.code_block = codeHandler;
    md.core.ruler.push('wx', plugin());
}

