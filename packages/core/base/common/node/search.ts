/**
 * @file
 * 1. 返回搜索到的文件地址
 * 2. 可指定返回关键字前后几行的内容
 * 3. 可以高亮关键字
 */
const fs = require('fs');
const find = require('find');

function readFile(filename: string) {
    return fs.readFileSync(filename, {
        encoding: 'utf-8'
    });
}
export interface ISearchOptions {
    highlight?: boolean;
    pattern: string;
    targetDir: string;
    fileFilter?: string | RegExp;
}
const options = {
    startTag : "<b class='highlight'>", // could be a hyperlink
    endTag   : "</b>" // or you could use <i> instead of <b> ... want it? ask!
}

function highlight(keywords: string | RegExp, text: string) {
    const matcher = new RegExp(keywords, 'gi');
    let times = 0;
  
    const line = text.replace(matcher, (match: string) => {
        times++;
        return options.startTag + match + options.endTag;
    });

    if (times) {
        return {
            line,
            times
        }
    } else {
        return null;
    }
}

export class SyncFindTextInDir {
    pattern: string;
    targetDir: string;
    fileFilter?: RegExp;
    highlight: boolean;
    constructor(options: ISearchOptions) {
        this.highlight = options.highlight || true;
        this.pattern = options.pattern;
        this.targetDir = options.targetDir;
        this.fileFilter = this.getFileFilter(options.fileFilter);
    }
    getFileFilter(fileFilter: string | undefined | RegExp) {
        if (typeof fileFilter === 'string') {
            fileFilter = new RegExp(fileFilter);
        } else if (typeof fileFilter === 'undefined') {
            fileFilter = new RegExp('.');
        }
        return fileFilter;
    }
    getMatchedData(
        content: string,
        data: {
            regex: RegExp;
            filename: string;
        }
    ) {
        if (!content) {
            return null;
        }
        const match = [];
        let times = 0;
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const res = highlight(data.regex, line);
            if (res) {
                times += res.times;
                match.push(res.line);
            }
        }
        return match.length !== 0 ? {
            list: match,
            filename: data.filename,
            times
        } : null;
    }
    getMatchedFiles(files: string[]) {
        let matchedFiles = [];
        for (let i = files.length - 1; i >= 0; i--) {
            const content = readFile(files[i]);
            const matched = this.getMatchedData(content, {
                regex: new RegExp(this.pattern, 'gi'),
                filename: files[i]
            });
            matched && matchedFiles.push(
                matched
            );
        }
        return matchedFiles;
    }
    findSync() {
        let res = null;
        try {
            const files = find.fileSync(this.fileFilter, this.targetDir);
            res = this.getMatchedFiles(files);
        } catch (err) {
            throw new Error('Not found here');
        }
        return res;
    }
}