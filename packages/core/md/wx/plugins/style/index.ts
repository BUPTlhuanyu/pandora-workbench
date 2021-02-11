/**
 * @file 用于修改全局的样式
 */
function plugin() {
    return function (state: any) {
        let tokens = state.tokens;
        if (!Array.isArray(tokens)) {
            return;
        }
        let newTokens: any[] = [];
        tokens.reduce((prev, cur) => {
            if (cur.tag === 'p') {
                cur.attrPush(['style', 'line-height: 1.8']);
            }
            prev.push(cur);
            return prev;
        }, newTokens);
        state.tokens = newTokens;
    };
}

export default function (md: any) {
    md.core.ruler.push('wx', plugin());
}

