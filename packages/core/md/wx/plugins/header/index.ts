/**
 * @file
 */
import {getStyleStr} from '../../../utils';
import {themeColor} from '../../common/constant';

const HEAD_ONE_OPEN = {
    tagStyle: () => {
        let header1Style = {
            margin: '32px 0 24px',
            position: 'relative',
            textAlign: 'center',
            fontSize: '2em',
            lineHeight: '1.2',
            fontWeight: 'bold',
            fontFamily: 'Optima-Regular'
        };
        return getStyleStr(header1Style);
    },
    extraHtml: () => {
        const style = {
            textAlign: 'center',
            display: 'inline-block',
            position: 'relative'
        };
        let styleStr = getStyleStr(style);
        return `<span style="${styleStr}">`;
    }
};

const HEAD_ONE_CLOSE = {
    extraHtml: () => {
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
    }
};

const HEAD_TWO_OPEN = {
    tagStyle: () => {
        let header1Style = {
            margin: '28px auto 20px',
            position: 'relative',
            fontSize: '1.5em',
            lineHeight: '1.2',
            fontWeight: 'bold',
            fontFamily: 'Optima-Regular'
        };
        return getStyleStr(header1Style);
    },
    extraHtml: () => {
        const style = {
            textAlign: 'center',
            display: 'inline-block',
            position: 'relative',
            padding: '0 10px',
            borderBottom: `6px solid ${themeColor}`
        };
        let styleStr = getStyleStr(style);
        return `<span style="${styleStr}">`;
    }
};

const HEAD_TWO_CLOSE = {
    extraHtml: () => {
        return '</span>';
    }
};

const HEAD_THREE_OPEN = {
    tagStyle: () => {
        let header2Style = {
            borderLeft: `2px solid ${themeColor}`,
            paddingLeft: '16px',
            margin: '24px auto 16px',
            fontSize: '1.2em',
            lineHeight: '1.2',
            fontWeight: 'bold',
            fontFamily: 'Optima-Regular'
        };
        return getStyleStr(header2Style);
    },
    extraHtml: () => ''
};

const HEAD_THREE_CLOSE = {
    extraHtml: () => ''
};

export default function (md: any) {
    md.renderer.rules.heading_open = function (tokens: any, index: number) {
        let token = tokens[index];
        let style: string = '';
        let extraHtml: string = '';
        switch (token.tag) {
            case 'h1': {
                style = HEAD_ONE_OPEN.tagStyle();
                extraHtml = HEAD_ONE_OPEN.extraHtml();
                break;
            }
            case 'h2': {
                style = HEAD_TWO_OPEN.tagStyle();
                extraHtml = HEAD_TWO_OPEN.extraHtml();
                break;
            }
            case 'h3': {
                style = HEAD_THREE_OPEN.tagStyle();
                extraHtml = HEAD_THREE_OPEN.extraHtml();
                break;
            }
            default: break;
        }
        return `<${token.tag} style='${style}'>${extraHtml}`;
    };
    md.renderer.rules.heading_close = function (tokens: any, index: number) {
        let token = tokens[index];
        let extraHtml: string = '';
        switch (token.tag) {
            case 'h1': {
                extraHtml = HEAD_ONE_CLOSE.extraHtml();
                break;
            }
            case 'h2': {
                extraHtml = HEAD_TWO_CLOSE.extraHtml();
                break;
            }
            case 'h3': {
                extraHtml = HEAD_THREE_CLOSE.extraHtml();
                break;
            }
            default: break;
        }
        return `${extraHtml}</${token.tag}>`;
    };
}
