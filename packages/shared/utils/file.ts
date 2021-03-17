// TODO: 范型
import FS from 'fs';
import PATH from 'path';

const constants = {
    DIRECTORY: 'directory',
    FILE: 'file'
};
const HIDDEN_REG = /^\..*/;

function safeReadDirSync(path: string) {
    let dirData: string[] = [];
    try {
        dirData = FS.readdirSync(path);
    } catch (ex) {
        if (ex.code == 'EACCES' || ex.code == 'EPERM') {
            //User does not have permissions, ignore directory
            return null;
        } else throw ex;
    }
    return dirData;
}

/**
 * Normalizes windows style paths by replacing double backslahes with single forward slahes (unix style).
 * @param  {string} path
 * @return {string}
 */
function normalizePath(path: string) {
    return path.replace(/\\/g, '/');
}

interface IOptions {
    exclude?: RegExp[];
    extensions?: RegExp;
    attributes?: string[];
    normalizePath?: boolean;
    excludeHidden?: boolean;
}
interface Iterm {
    name: string;
    path: string;
    size: number;
    extension?: string;
    type?: string;
    [key: string]: any;
}

export type IOnEachFile = (item: Iterm, path: string, stats: FS.Stats) => void;
export type IOnEachDirectory = (item: Iterm, path: string, stats: FS.Stats) => void;

/**
 * Collects the files and folders for a directory path into an Object, subject
 * to the options supplied, and invoking optional
 * @param  {String} path
 * @param  {Object} options
 * @param  {function} onEachFile
 * @param  {function} onEachDirectory
 * @return {Object}
 */
export function directoryTree(
    path: string,
    options: IOptions,
    onEachFile?: IOnEachFile,
    onEachDirectory?: IOnEachDirectory,
	idx?: number[]
) {
    const name = PATH.basename(path);
    path = options && options.normalizePath ? normalizePath(path) : path;
    const item: Iterm = {path, name, size: 0};
    let stats: FS.Stats;

    try {
        stats = FS.statSync(path);
    } catch (e) {
        return null;
    }

    // Skip if it matches the exclude regex
    if (options && options.exclude) {
        let excludes: RegExp[] = options.exclude;
        if (excludes.some(exclusion => exclusion.test(path))) {
            return null;
        }
    }
    if (options && options.excludeHidden && HIDDEN_REG.test(name)) {
        return null;
    }

    if (stats.isFile()) {
        const ext = PATH.extname(path).toLowerCase();

        // Skip if it does not match the extension regex
        if (options && options.extensions && !options.extensions.test(ext)) return null;

        item.size = stats.size; // File size in bytes
        item.extension = ext;
        item.type = constants.FILE;
		item.index = idx;

        if (options && options.attributes) {
            options.attributes.forEach((attribute: string) => {
                item[attribute] = stats[attribute as keyof typeof stats];
            });
        }

        if (onEachFile) {
            onEachFile(item, path, stats);
        }
    } else if (stats.isDirectory()) {
        let dirData = safeReadDirSync(path);
        if (dirData === null) return null;

        if (options && options.attributes) {
            options.attributes.forEach(attribute => {
                item[attribute] = stats[attribute as keyof typeof stats];
            });
        }
        item.children = dirData
            .map((child, i) => directoryTree(PATH.join(path, child), options, onEachFile, onEachDirectory, []))
            .filter(e => !!e);
        item.size = item.children.reduce((prev: number, cur: Iterm) => prev + cur.size, 0);
        item.type = constants.DIRECTORY;
        if (onEachDirectory) {
            onEachDirectory(item, path, stats);
        }
    } else {
        return null; // Or set item.size = 0 for devices, FIFO and sockets ?
    }
    return item;
}
