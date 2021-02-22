/**
 * @file
 */
import MarkdownIt from 'markdown-it';

import {
    blockcode,
    blockquote,
    header,
    commonstyle,
    reference
} from './wx/plugins';

type TransformType = 'wx' | 'zhihu';
interface MdOptInterface {};

const defaultMdOpt = {};

export function getMd(type: TransformType, mdOpt: MdOptInterface = {}) {
    let options = Object.assign({}, defaultMdOpt, mdOpt);
    switch (type) {
        case 'wx': {
            let md: any = new MarkdownIt('default', options);
            return md.use(blockcode)
                    .use(blockquote)
                    .use(header)
                    .use(commonstyle)
                    .use(reference);
        }
        case 'zhihu': {
            let md: any = new MarkdownIt('default', options);
            return md;
        }
        default: {
            let md: any = new MarkdownIt('default', options);
            return md;
        }
    }
}
