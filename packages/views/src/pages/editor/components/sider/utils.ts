/**
 * @file
 */
import produce from 'immer';

export function getRootPath(path: string) {
    if (typeof path !== 'string') {
        return '';
    }
    const lastIndex = path.lastIndexOf('/');
    let rootPath = path;
    if (path.indexOf('.') > 0) {
        rootPath = path.substring(0, lastIndex);
    }
    return rootPath;
}

export function updateNodeData(nodeData: Record<string, any>, newName: string) {
    if (!nodeData || !nodeData.path || !newName) {
        return;
    }
    const lastIndexPath = nodeData.path.lastIndexOf('/');
    const parentPath = nodeData.path.substring(0, lastIndexPath);
    const newPath = `${parentPath}/${newName}`;
    const lastIndexExt = newName.lastIndexOf('.');
    nodeData.extension = lastIndexExt > 0 ? newName.substring(newName.lastIndexOf('.')) : '';
    nodeData.key = newPath;
    nodeData.path = newPath;
    nodeData.title = newName;
    nodeData.name = newName;
    nodeData.exist = true;
}

function createFile(path: string, index: number) {
    return {
        extension: '.md',
        index: [],
        isLeaf: true,
        key: `${path}/Untitled${index}.md`,
        name: `Untitled${index}.md`,
        path: `${path}/Untitled${index}.md`,
        size: 0,
        title: `Untitled${index}.md`,
        type: 'file',
        exist: false
    };
}

function createDir(path: string, index: number) {
    return {
        children: [],
        exist: false,
        size: 0,
        name: `Untitled Folder${index}`,
        title: `Untitled Folder${index}`,
        key: `${path}/Untitled Folder${index}`,
        path: `${path}/Untitled Folder${index}`,
        type: 'directory'
    };
}

export function addToTreeData(tree: any, path: string, type: 'file' | 'directory') {
    let addedNode: Record<string, any> = {};
    let nextTree = produce(tree, (draftTree: any) => {
        let item = null;
        let root = draftTree[0];
        if (root) {
            let stack: Record<string, any> = [root];
            while (stack.length > 0) {
                let node = stack.pop();
                if (node.type === 'directory' && Array.isArray(node.children) && node.path === path) {
                    let maxIndex = 1;
                    for (let i of node.children) {
                        let reg = type === 'file' ? /Untitled([^/]*)\.md$/ : /Untitled\sFolder([^/]*)$/;
                        const match = reg.exec(i.path);
                        if (match && match[1] && typeof +match[1] === 'number') {
                            let curIndex = +match[1];
                            if (!Number.isNaN(curIndex) && typeof curIndex === 'number' && curIndex > maxIndex) {
                                maxIndex = curIndex;
                            }
                        }
                    }
                    maxIndex += 1;
                    item = type === 'file' ? createFile(path, maxIndex) : createDir(path, maxIndex);
                    node.children.push(item);
                    addedNode = item;
                    stack.length = 0;
                    return;
                }
                if (node.children && node.children.length > 0) {
                    let len = node.children.length;
                    for (let i = 0; i < len; i++) {
                        stack.push(node.children[i]);
                    }
                }
            }
        }
    });
    return {
        nextTree,
        node: addedNode
    };
}

export function deleteToTreeData(tree: any, path: string) {
    let rootPath = getRootPath(path);
    let selectedFile = '';
    let nextTree = produce(tree, (draftTree: any) => {
        let root = draftTree[0];
        if (root) {
            let stack: Record<string, any> = [root];
            while (stack.length > 0) {
                let node = stack.pop();
                if (Array.isArray(node.children) && node.path === rootPath) {
                    let len = node.children.length;
                    for (let i = 0; i < len; i++) {
                        if (node.children[i].path === path) {
                            if (node.children[i + 1]) {
                                selectedFile = node.children[i + 1].key;
                            } else if (node.children[i - 1]) {
                                selectedFile = node.children[i - 1].key;
                            } else {
                                selectedFile = node.key;
                            }
                            node.children.splice(i, 1);
                            break;
                        }
                    }
                    stack.length = 0;
                    return;
                }
                if (node.children && node.children.length > 0) {
                    let len = node.children.length;
                    for (let i = 0; i < len; i++) {
                        stack.push(node.children[i]);
                    }
                }
            }
        }
    });
    return {
        nextTree,
        selectedFile
    };
}
