/**
 * @file
 */
/**
 * 将camel-case转换成kebabCase
 * @param {Object} style 样式对象
 * @return {string}
 */
export function getStyleStr(style: Record<string, any>) {
    return Object.entries(style).reduce((prev: string, cur: [string, string]) => {
        let key = cur[0];
        let value = cur[1];
        let kebabCaseKey: string = key.replace(/([A-Z])/g, (up: string) => {
            return `-${up.toLowerCase()}`;
        });
        return prev + `${kebabCaseKey}: ${value};`;
    }, '');
}
