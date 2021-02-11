/**
 * @file
 */
/**
 * @file
 */
import {getStyleStr} from '../../../utils';
import {grayColor, themeColor} from '../../common/constant';

const BLOCK_QUOTE: Record<string, any> = {
    type: 'block_before',
    tag: 'span'
};

function createBlockQuoteBefore(TokenCtr: any) {
    let {type, tag} = BLOCK_QUOTE;
    let tokenBefore = new TokenCtr(type, tag, 1);
    return tokenBefore;
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
        let newTokens: any[] = [];
        tokens.reduce((prev, cur) => {
            // cur.attrs = [['class', 'test-head']];
            if (cur.type === 'blockquote_open') {
                opening = true;
                let blockquote = addBlockQuoteStyle(cur);
                prev.push(blockquote);
                return prev;
            }
            else if (cur.type === 'blockquote_close') {
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

export default function (md: any) {
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
    md.core.ruler.push('wx', plugin());
}

