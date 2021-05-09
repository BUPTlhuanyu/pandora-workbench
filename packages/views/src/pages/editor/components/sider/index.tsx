import * as React from 'react';
import './index.scss';
import getClassname from 'views/src/utils/classMaker';
import FileFolder, {ItreeData} from 'views/src/components/file-folder';
import Icon from 'views/src/components/icon';
import {taotie} from 'views/src/services/taotie';
import {FS_CREATE_FILE, FS_CREATE_DIR, FS_EDIT, fileEvent} from 'views/src/utils/event';
import {Input} from 'antd';
import produce from 'immer';

import {FileContext} from 'views/src/pages/editor/store/sidbar';
import {EditorContext} from 'views/src/pages/editor/store/editor';

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
    const lastIndex = path.lastIndexOf('/');
    let rootPath = path;
    if (path.indexOf('.') > 0) {
        rootPath = path.substring(0, lastIndex);
    }
    return rootPath;
}

function addToTreeData(tree: any, path: string) {
    let newFile: Record<string, any> = {};
    let nextTree = produce(tree, (draftTree: any) => {
        let item = null;
        for (let root of draftTree) {
            let node = root;
            while (node) {
                if (node.type === 'directory' && Array.isArray(node.children) && node.path === path) {
                    let maxIndex = 1;
                    for (let i of node.children) {
                        const match = /Untitled(.*)\.md/.exec(i.path);
                        if (match && match[1]) {
                            let curIndex = +match[1];
                            if (!Number.isNaN(curIndex) && typeof curIndex === 'number' && curIndex > maxIndex) {
                                maxIndex = curIndex;
                            }
                        }
                    }
                    maxIndex += 1;
                    item = {
                        extension: '.md',
                        index: [],
                        isLeaf: true,
                        key: `${path}/Untitled${maxIndex}.md`,
                        name: '',
                        path: `${path}/Untitled${maxIndex}.md`,
                        size: 0,
                        title: `Untitled${maxIndex}.md`,
                        type: 'file',
                        exist: false
                    };
                    node.children.push(item);
                    newFile = item;
                    return;
                }
                node = node.children;
            }
        }
    });
    return {
        nextTree,
        newFile
    };
}

export default React.forwardRef(function Sider(props: ISiderProps, ref: any) {
    const contextRef = React.useRef<boolean>(false);
    const [{editor}] = React.useContext(EditorContext);
    const [{selectedFilePath}, dispatch] = React.useContext(FileContext);
    const [renameKey, setRenameKey] = React.useState<string>('');
    const [treeData, setTreeData] = React.useState<ItreeData>([]);
    const [mouseEnter, setMouseEbter] = React.useState<boolean>(false);
    const [showPanel, setShowPanel] = React.useState<boolean>(false);
    const [caseSensitive, setCaseSensitive] = React.useState<boolean>(false);
    const [wholeWord, setWholeWord] = React.useState<boolean>(false);

    const onSelect = React.useCallback(
        (keys: Array<string | number>, {node}: Record<string, any>) => {
            dispatch({
                type: 'selectedFile',
                payload: keys[0] || node.path
            });
            if (keys[0] !== renameKey) {
                setRenameKey('');
            }
        },
        [dispatch, renameKey]
    );

    const [className] = React.useState(() => {
        return getClassname({
            'taotie-sider-wrapper': true,
            [props.className]: true
        });
    });

    const onMouseEnter = React.useCallback(() => {
        if (!contextRef.current) {
            setMouseEbter(true);
        } else {
            contextRef.current = false;
        }
    }, [setMouseEbter]);

    const onMouseLeave = React.useCallback(() => {
        if (!contextRef.current) {
            setMouseEbter(false);
        }
    }, [setMouseEbter]);

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
        setShowPanel(true);
    }, [setShowPanel]);

    const onContentMode = React.useCallback(() => {
        // 用于切换大纲和文件列表
    }, []);

    const getTreeData = React.useCallback(() => {
        taotie &&
            taotie.ipcRenderer.invoke('taotie:dialog').then(treeData => {
                treeData && setTreeData(treeData as ItreeData);
            });
    }, []);

    React.useEffect(() => {
        fileEvent.removeAllListeners(FS_CREATE_FILE);
        fileEvent.on(FS_CREATE_FILE, () => {
            if (!treeData[0]) {
                return;
            }
            // 清空编辑器内容
            editor && editor?.getDoc().setValue('');
            let rootDir = selectedFilePath ? selectedFilePath : treeData[0].path;
            rootDir = getRootPath(rootDir);
            contextRef.current = true;
            // treeData 插入
            const {newFile, nextTree} = addToTreeData(treeData, rootDir);
            if (newFile.key && nextTree) {
                dispatch({
                    type: 'selectedFile',
                    payload: newFile.key
                });
                setTreeData(nextTree as any);
            }
        });

        fileEvent.removeAllListeners(FS_CREATE_DIR);
        fileEvent.on(FS_CREATE_DIR, () => {
            console.log('FS_CREATE_DIR', treeData);
        });
    }, [treeData, selectedFilePath]);

    const onKeyPress = React.useCallback((newPath: string) => {
        const content = editor?.getDoc().getValue() || '';
        if (!taotie) {
            return Promise.reject();
        }
        return taotie.ipcRenderer.invoke('taotie:writeFile', newPath, content);
    }, []);

    const onBlur = React.useCallback((newPath: string) => {
        const content = editor?.getDoc().getValue() || '';
        if (!taotie) {
            return Promise.reject();
        }
        // TODO: editor应该是全局状态
        return taotie.ipcRenderer.invoke('taotie:writeFile', newPath, content);
    }, []);

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
    const onRename = React.useCallback((oldPath: string, newName: string) => {
        if (!taotie) {
            return Promise.reject();
        }
        const content = editor?.getDoc().getValue() || '';
        return taotie.ipcRenderer.invoke(
            'taotie:renameFile',
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
    }, [treeData, dispatch]);

    return (
        <div
            className={className}
            ref={ref}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            data-context="sider"
        >
            <div className="taotie-sider-container">
                <div className="sider-title">
                    {mouseEnter && (
                        <span onClick={onContentMode} className="sider-title-icon sider-title-list" title="大纲/列表">
                            <Icon type="list" style={{fontSize: '20px'}} />
                        </span>
                    )}
                    <div>文件</div>
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
                <FileFolder
                    className="sider-file-folder"
                    treeData={treeData}
                    onRename={onRename}
                    onSelect={onSelect}
                    onBlur={onBlur}
                    onKeyPress={onKeyPress}
                    renameKey={renameKey}
                    selectedFilePath={selectedFilePath}
                />
                {mouseEnter && (
                    <div className="sider-footer" onClick={getTreeData}>
                        打开文件夹...
                    </div>
                )}
            </div>
        </div>
    );
});
