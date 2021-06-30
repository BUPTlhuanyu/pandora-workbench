/**
 * @file
 */
import codemirror from 'codemirror';

interface ITocItem {
    title: string;
    line: number;
    level: number;
}

// const TAB = '\u00A0\u00A0\u00A0\u00A0';
export function getMdOutline(editor: codemirror.Editor, tab?: string): ITocItem[] {
    if (!editor || !editor.getDoc) {
        return [];
    }
    let content = editor.getDoc().getValue('\n');
    return content.split('\n').map((item: string, line: number) => {
        // @ts-ignore
        const tokens = editor.getLineTokens(line);
        const start = tokens[0];
        if (start && typeof start.type === 'string' && start.type?.indexOf('header') >= 0) {
            const matched = /header-([0-9])/.exec(start.type);
            let level = 0;
            if (matched && !isNaN(level = +matched[1])) {
                return {
                    title: `${tab ? tab.repeat(level - 1) : ''}${item.replace(start.string, '')}`,
                    line,
                    level
                };
            }
        }
        return null;
    }).filter(Boolean) as ITocItem[];
}
