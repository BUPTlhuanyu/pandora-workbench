/**
 * @file 将外链转为引用
 * FIXME：codemirror每次内容改变会导致整体内容都重新被解析
 */
import MarkdownIt from 'markdown-it';
import {getStyleStr} from '../../../utils';

/* 生成对应的state.env */

interface Refer {
    href: string;
    content: string;
}

/**
 * 给定tokens生成对应的state.env
 * @param tokens 
 */
function genEnvReferList(tokens: any[]) {
    let tokenStack = 0;
    let referList: Refer[] = [];
    let refer: Refer = {
        href: '',
        content: ''
    };
    for (let token of tokens) {
        if (!token) {
            return null;
        }
        switch(token.type) {
            case 'link_open': {
                let href = token.attrGet('href');
                refer.href = href;
                tokenStack++;
                break;
            }
            case 'link_close': {
                // 当栈中没有link_open，那么必定是解析出错了，比如'}{'
                if (tokenStack <= 0) {
                    console.warn('link parser error');
                    return null;
                }
                refer = {
                    href: '',
                    content: ''
                };;
                tokenStack--;
                break;
            }
            case 'text': {
                if (tokenStack > 0 && token.meta !== 'done') {
                    refer.content = token.content;
                    referList.push(refer);
                    // 标记该token已经处理
                    token.meta = 'done';
                }
                break;
            }
            default: break;
        }
    }
    if (tokenStack === 0) {
        return referList;
    }
    return null;
}

/**
 * 用于修改link的rule
 * @param md 
 */
function rulesLink(md: any) {
    let ruleLinkObj = md.inline.ruler.__rules__[md.inline.ruler.__find__('link')];
    let originLinkFn = ruleLinkObj.fn;
    return function (state: any, silent: any) {
        // 一段md源码在link规则中会多次掉哟郜该函数，所有的返回值应该组合起来生成referList
        let res = originLinkFn(state, silent);
        if (res) {
            let referList = genEnvReferList(state.tokens);
            let env = state.env;
            if (referList) {
                if (!('referList' in env)) {
                    env.referList = referList;
                }
                else {
                    env.referList.push(...referList);
                }
            }
        }
        return res;
    };
}

/* 根据state.env生成对应的token */

/**
 * 用于生成参考文献对应的token数组
 * @param tokenCtr Token 构造函数
 * @param referList 引用数据
 */
function createReferTokens(tokenCtr: any, referList: Refer[]) {
    // refergroup_open
    //      refer_inline
    //      refer_inline
    // refergroup_close
    let tokenList = [];
    let refergroupOpen = new tokenCtr('refergroup_open', 'div', 1);
    let referInlineTokenList = referList.map((refer: Refer, index: number) => {
        let referInlineToken = new tokenCtr('refer_inline', '', 0);
        referInlineToken.meta = Object.assign({}, refer, {id: index + 1});
        return referInlineToken;
    });
    let refergroupClose = new tokenCtr('refergroup_close', 'div', -1);
    tokenList.push(refergroupOpen, ...referInlineTokenList, refergroupClose);
    return tokenList;
}

/**
 * 根据env修改tokens
 */
function plugin() {
    return function (state: any) {
        let tokens = state.tokens;
        if (!Array.isArray(tokens)) {
            return;
        }
        let env = state.env;
        if (!env || !Array.isArray(env.referList)) {
            return;
        }
        state.tokens = [...tokens, ...createReferTokens(state.Token, env.referList)];
    };
}

/* 渲染token */

/**
 * 渲染link_open的token
 * @param tokens 
 * @param index 
 * @param options 
 * @param env 
 * @param renderer 
 */
function linkOpenTokenHandler(
    tokens: any,
    index: number,
    options: MarkdownIt.Options,
    env: any,
    renderer: Record<any, any>
) {
    let linkStyle = getStyleStr({
        color: '#ffb11b',
        fontWeight: '600'
    });
    return `<span style='${linkStyle}'>`;
}

/**
 * 渲染link_close的token
 * @param tokens 
 * @param index 
 * @param options 
 * @param env 
 * @param renderer 
 */
function linkCloseTokenHandler(
    tokens: any,
    index: number,
    options: MarkdownIt.Options,
    env: any,
    renderer: Record<any, any>
) {
    if (!('referCount' in env)) {
        env.referCount = 0;
    }
    let subStyle = getStyleStr({
        top:' -.5em',
        fontSize: '75%',
        position: 'relative',
        color: '#ffb11b'
    });
    let subTagStr = `<span style='${subStyle}'>[${++env.referCount}]</span>`;
    return `</span>${subTagStr}`;
}

/**
 * 渲染refergroup_open的token
 */
function refergroupOpenTokenRenderer() {
    let titleStyle = getStyleStr({
        fontSize: '16px',
        fontWeight: '600'
    });
    return `<div><p style='${titleStyle}'>参考文献</p>`;
}

/**
 * 渲染refergroup_close的token
 */
function refergroupCloseTokenRenderer() {
    return '</div>';
}

/**
 * 渲染refer_inline的token
 */
function referInlineTokenRenderer(tokens: any, index: number) {
    let inlineToken = tokens[index];
    if (!inlineToken.meta) {
        return '';
    }
    let {
        content = '',
        href = '',
        id
    } = inlineToken.meta;
    let pStyle = getStyleStr({
        display: 'flex'
    });
    let idStyle = getStyleStr({
        paddingTop: '1px',
        whiteSpace: 'nowrap',
        marginRight: '8px',
        fontSize: '14px'
    });
    let hrefStyle = getStyleStr({
        lineHeight: '1.4',
        wordBreak: 'break-all',
        color: '#6b6b6b'
    });
    return `
        <p style='${pStyle}'>
            <span style='${idStyle}'>[${id}]</span>
            <span style='line-height: 1'>
                ${content}:  
                <em style='${hrefStyle}'>${decodeURIComponent(href).replace(/['"]/g, '')}</em>
            </span>
        </p>
    `;
}

export default function (md: any) {
    md.renderer.rules.link_open = linkOpenTokenHandler;
    md.renderer.rules.link_close = linkCloseTokenHandler;
    md.renderer.rules.refergroup_open = refergroupOpenTokenRenderer;
    md.renderer.rules.refergroup_close = refergroupCloseTokenRenderer;
    md.renderer.rules.refer_inline = referInlineTokenRenderer;

    md.inline.ruler.at('link', rulesLink(md));
    md.core.ruler.push('wx', plugin());
}
