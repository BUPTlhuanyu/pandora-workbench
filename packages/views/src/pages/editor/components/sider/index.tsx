import * as React from 'react';
import './index.scss';
import getClassname from 'views/src/utils/classMaker';
import FileFolder, {ItreeData} from 'views/src/components/file-folder';
import Icon from 'views/src/components/icon';
import {pandora} from 'views/src/services/pandora';
import {revealFileInOs, moveFileToTrash} from 'views/src/services/messageCenter';
import {FS_CREATE_FILE, FS_CREATE_DIR, FS_EDIT, FS_DELETE, fileEvent, FS_REVEAL} from 'views/src/utils/event';
import {Input} from 'antd';
import produce from 'immer';

import {FileContext} from 'views/src/pages/editor/store/sidbar';
import {EditorContext} from 'views/src/pages/editor/store/editor';

import {isFilePath} from 'views/src/utils/tools';

function updateNodeData(nodeData: Record<string, any>, newName: string) {
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

interface ISiderProps {
    className: string;
}

function getRootPath(path: string) {
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

function addToTreeData(tree: any, path: string, type: 'file' | 'directory') {
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

function deleteToTreeData(tree: any, path: string) {
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

export default React.forwardRef(function Sider(props: ISiderProps, ref: any) {
    const contextRef = React.useRef<boolean>(false);
    const [{editor}] = React.useContext(EditorContext);
    const [{selectedFilePath}, dispatch] = React.useContext(FileContext);
    const [renameKey, setRenameKey] = React.useState<string>('');
    const [treeData, setTreeData] = React.useState<ItreeData>([]);
    const [mouseEnter, setMouseEnter] = React.useState<boolean>(false);
    const [showPanel, setShowPanel] = React.useState<boolean>(false);
    const [caseSensitive, setCaseSensitive] = React.useState<boolean>(false);
    const [wholeWord, setWholeWord] = React.useState<boolean>(false);

    const onSelect = React.useCallback(
        (keys: Array<string | number>, {node}: Record<string, any>) => {
            if (isFilePath(selectedFilePath)) {
                const content = editor?.getDoc().getValue() || '';
                pandora && pandora.ipcRenderer.invoke('pandora:writeFile', selectedFilePath, content).then(() => {
                    // TODO: 编辑状态
                }).catch(err => {
                    console.log(err);
                });
            }
            dispatch({
                type: 'selectedFile',
                payload: keys[0] || node.path
            });
            if (keys[0] !== renameKey) {
                setRenameKey('');
            }
        },
        [dispatch, renameKey, editor, selectedFilePath]
    );

    const [className] = React.useState(() => {
        return getClassname({
            'pandora-sider-wrapper': true,
            [props.className]: true
        });
    });

    const onMouseEnter = React.useCallback(() => {
        if (!contextRef.current) {
            setMouseEnter(true);
        } else {
            contextRef.current = false;
        }
    }, [setMouseEnter]);

    const onMouseLeave = React.useCallback(() => {
        if (!contextRef.current) {
            setMouseEnter(false);
        }
    }, [setMouseEnter]);

    const onCaseSensitive = React.useCallback(() => {
        setCaseSensitive(!caseSensitive);
    }, [caseSensitive, setCaseSensitive]);

    const onCheckWholeWord = React.useCallback(() => {
        setWholeWord(!wholeWord);
    }, [wholeWord, setWholeWord]);

    const onShowPanel = React.useCallback(() => {
        setShowPanel(!showPanel);
    }, [showPanel, setShowPanel]);

    const onStartSearch = React.useCallback(() => {
        pandora &&
        pandora.ipcRenderer.invoke('pandora:fileSearch');
        setShowPanel(true);
    }, [setShowPanel]);

    const onContentMode = React.useCallback(() => {
        // 用于切换大纲和文件列表
    }, []);

    const getTreeData = React.useCallback(() => {
        pandora &&
            pandora.ipcRenderer.invoke('pandora:dialog').then(treeData => {
                if (!treeData) {
                    return;
                }
                setTreeData([]);
                treeData && setTreeData(treeData as ItreeData);
                dispatch({
                    type: 'selectedFile',
                    payload: treeData[0].key
                });
            });
    }, []);

    React.useEffect(() => {
        // 在finder中打开
        fileEvent.removeAllListeners(FS_CREATE_FILE);
        fileEvent.on(FS_REVEAL, path => {
            path = path || selectedFilePath;
            revealFileInOs(path);
        });
        fileEvent.removeAllListeners(FS_CREATE_FILE);
        fileEvent.on(FS_CREATE_FILE, () => {
            if (!treeData[0]) {
                return;
            }
            // 清空编辑器内容
            editor && editor?.getDoc().setValue('');
            let rootDir = selectedFilePath ? selectedFilePath : treeData[0].path;
            rootDir = getRootPath(rootDir);
            if (!rootDir) {
                return;
            }
            contextRef.current = true;
            // treeData 插入
            const {node, nextTree} = addToTreeData(treeData, rootDir, 'file');
            if (node.key && nextTree) {
                dispatch({
                    type: 'selectedFile',
                    payload: node.key
                });
                setTreeData(nextTree as any);
            }
        });

        fileEvent.removeAllListeners(FS_CREATE_DIR);
        fileEvent.on(FS_CREATE_DIR, () => {
            if (!treeData[0]) {
                return;
            }
            // 清空编辑器内容
            let rootDir = selectedFilePath ? selectedFilePath : treeData[0].path;
            rootDir = getRootPath(rootDir);
            contextRef.current = true;
            // treeData 插入
            const {node, nextTree} = addToTreeData(treeData, rootDir, 'directory');
            if (node.key && nextTree) {
                dispatch({
                    type: 'selectedFile',
                    payload: node.key
                });
                setTreeData(nextTree as any);
            }
        });
        fileEvent.removeAllListeners(FS_DELETE);
        fileEvent.on(FS_DELETE, path => {
            path = path || selectedFilePath;
            moveFileToTrash(path);
            const {selectedFile, nextTree} = deleteToTreeData(treeData, path);
            if (nextTree) {
                selectedFilePath === path && dispatch({
                    type: 'selectedFile',
                    payload: selectedFile
                });
                setTreeData(nextTree as any);
            }
        });
    }, [treeData, selectedFilePath]);

    const fsRename = React.useCallback((key: string) => {
        dispatch({
            type: 'selectedFile',
            payload: key
        });
        setRenameKey(key);
    }, [setRenameKey]);

    React.useEffect(() => {
        fileEvent.on(FS_EDIT, fsRename);
        return () => {
            fileEvent.off.bind(null, FS_EDIT, fsRename);
        };
    }, []);

    const immerTreeData = React.useCallback((nodeKey: string, name: string) => {
        if (treeData.length > 0) {
            setTreeData(produce(treeData, draftTreeData => {
                let root = draftTreeData[0];
                if (root) {
                    let stack: Record<string, any> = [root];
                    while (stack.length > 0) {
                        let node = stack.pop();
                        if (node.key === nodeKey) {
                            updateNodeData(node, name);
                            stack.length = 0;
                            break;
                        }
                        if (node.children && node.children.length > 0) {
                            let len = node.children.length;
                            for (let i = 0; i < len; i++) {
                                stack.push(node.children[i]);
                            }
                        }
                    }
                }
            }));
        }
    }, [treeData, setTreeData]);

    // useCallback 嵌套：内部的callback的依赖是从外层callback获取的，所以这里需要声明treeData
    const onRename = React.useCallback((oldPath: string, newName: string, nodeData: Record<string, any>) => {
        if (!pandora) {
            return Promise.reject();
        }
        if (nodeData.type === 'file') {
            const content = editor?.getDoc().getValue() || '';
            return pandora.ipcRenderer.invoke(
                'pandora:renameFile',
                oldPath,
                newName,
                content
            ).then(res => {
                // TODO: 数据格式
                if (res.success) {
                    dispatch({
                        type: 'selectedFile',
                        payload: res.data
                    });
                    immerTreeData(oldPath, newName);
                    return true;
                } else {
                    return false;
                }
            }).catch(err => {
                console.log(err);
            });
        } else if (nodeData.type === 'directory') {
            return pandora.ipcRenderer.invoke(
                'pandora:renameDir',
                oldPath,
                newName
            ).then(res => {
                console.log('res', res);
                // TODO: 数据格式
                if (res.success) {
                    dispatch({
                        type: 'selectedFile',
                        payload: res.data
                    });
                    immerTreeData(oldPath, newName);
                    return true;
                } else {
                    return false;
                }
            }).catch(err => {
                console.log(err);
            });
        }
    }, [treeData, dispatch]);

    return (
        <div
            className={className}
            ref={ref}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            data-context="sider"
        >
            <div className="pandora-sider-container" data-context="sider">
                <div className="sider-title">
                    {mouseEnter && (
                        <span onClick={onContentMode} className="sider-title-icon sider-title-list" title="大纲/列表">
                            <Icon type="list" style={{fontSize: '20px'}} />
                        </span>
                    )}
                    <div className="sider-title-text">文件</div>
                    {mouseEnter && (
                        <span onClick={onStartSearch} className="sider-title-icon sider-title-search" title="查找">
                            <Icon type="search" style={{fontSize: '20px'}} />
                        </span>
                    )}
                </div>
                {showPanel && (
                    <div className="sider-panel">
                        <span className="sider-panel-icon sider-panel-back" onClick={onShowPanel}>
                            <Icon type="left" style={{fontSize: '20px'}} />
                        </span>
                        <Input
                            placeholder="查找"
                            className="sider-panel-input"
                            suffix={
                                <>
                                    <span
                                        title="区分大小写"
                                        className={`sider-panel-icon ${
                                            caseSensitive ? 'sider-panel-input-selected' : ''
                                        }`}
                                        onClick={onCaseSensitive}
                                    >
                                        <Icon type="case" style={{fontSize: '20px'}} />
                                    </span>
                                    <span
                                        title="查找整个单词"
                                        className={`sider-panel-icon ${wholeWord ? 'sider-panel-input-selected' : ''}`}
                                        onClick={onCheckWholeWord}
                                    >
                                        <Icon type="word" style={{fontSize: '20px'}} />
                                    </span>
                                </>
                            }
                        />
                    </div>
                )}
                {
                    treeData.length > 0 && <FileFolder
                        className="sider-file-folder"
                        treeData={treeData}
                        onRename={onRename}
                        onSelect={onSelect}
                        renameKey={renameKey}
                        selectedFilePath={selectedFilePath}
                        expandAction="click"
                        defaultExpandedKeys={[treeData[0].path]}
                    />
                }
                {mouseEnter && (
                    <div className="sider-footer" onClick={getTreeData}>
                        打开文件夹...
                    </div>
                )}
            </div>
        </div>
    );
});
