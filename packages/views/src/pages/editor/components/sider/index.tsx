import './index.scss';
import * as React from 'react';
import produce from 'immer';

import FileFolder, {ItreeData} from 'views/src/components/file-folder';
import SearchList, {ISearchResult} from 'views/src/components/search-list';
import TocList, {ITocItem} from 'views/src/components/toc-list';
import Icon from 'views/src/components/icon';
import Header from './header';

import {pandora} from 'views/src/services/pandora';
import {revealFileInOs, moveFileToTrash} from 'views/src/services/messageCenter';

import {FS_CREATE_FILE, FS_CREATE_DIR, FS_EDIT, FS_DELETE, fileEvent, FS_REVEAL} from 'views/src/utils/event';
import {isFilePath} from 'views/src/utils/tools';
import {getMdOutline} from 'views/src/utils/markdown-helper';
import getClassname from 'views/src/utils/classMaker';
import {addToTreeData, deleteToTreeData, getRootPath, updateNodeData} from './utils';

import {FileContext} from 'views/src/pages/editor/store/sidbar';
import {EditorContext} from 'views/src/pages/editor/store/editor';

interface ISiderProps {
    className: string;
}

export default React.forwardRef(function Sider(props: ISiderProps, ref: any) {
    const contextRef = React.useRef<boolean>(false);
    const [{editor}] = React.useContext(EditorContext);
    const [{selectedFilePath}, dispatch] = React.useContext(FileContext);
    const [renameKey, setRenameKey] = React.useState<string>('');
    const [treeData, setTreeData] = React.useState<ItreeData>([]);
    const [mouseEnter, setMouseEnter] = React.useState<boolean>(false);

    const [showPanel, setShowPanel] = React.useState<boolean>(false);
    const [searchResult, setSearchResult] = React.useState<ISearchResult[]>([]);

    const [showToc, setShowToc] = React.useState<boolean>(false);
    const [tocList, setTocList] = React.useState<ITocItem[]>([]);

    // TODO: 放到 useCodeMirror
    const scrollEditor = React.useCallback(
        (line: number) => {
            // TODO: 封装
            // 1. 去掉硬编码，34 是头部高度30 + padding高度4
            // 2. editor.charCoords({line}, 'line') 获取字符相对于行的top值
            // 3. editor.charCoords({line}).top 获取字符相对于page的top
            editor.scrollTo(0, editor.charCoords({line}, 'local').top - editor.charCoords({line}, 'line').top);
            const textMarker = editor.getDoc().markText(
                {line: line - 1},
                {line},
                {
                    css: 'background-color: #FFFAAA',
                    atomic: true
                }
            );
            setTimeout(() => {
                textMarker.clear();
            }, 500);
        },
        [editor]
    );

    const onTocSelect = React.useCallback((item: ITocItem) => {
        scrollEditor(item.line);
    }, [editor]);

    const onSearchSelect = React.useCallback(
        filename => {
            dispatch({
                type: 'selectedFile',
                payload: filename
            });
        },
        [dispatch]
    );

    const onLineSelect = React.useCallback(
        (line: number, _, filename: string) => {
            try {
                if (filename !== selectedFilePath) {
                    dispatch({
                        type: 'selectedFile',
                        payload: filename
                    });
                    // TODO: 中间存在一个读取的操纵，因此这里会存在bug
                    setTimeout(() => {
                        scrollEditor(line);
                    }, 200);
                } else {
                    scrollEditor(line);
                }
            } catch (e) {}
        },
        [editor, selectedFilePath, dispatch]
    );

    const onSelect = React.useCallback(
        (keys: Array<string | number>, {node}: Record<string, any>) => {
            if (isFilePath(selectedFilePath)) {
                const content = editor?.getDoc().getValue() || '';
                pandora &&
                    pandora.ipcRenderer
                        .invoke('pandora:writeFile', selectedFilePath, content)
                        .then(() => {
                            // TODO: 编辑状态
                        })
                        .catch(err => {
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

    const onShowPanel = React.useCallback(() => {
        setShowPanel(!showPanel);
    }, [showPanel, setShowPanel]);

    const onStartSearch = React.useCallback(
        (value: string, caseSensitive: boolean, wholeWord: boolean) => {
            if (!value) {
                setSearchResult([]);
            } else if (treeData[0]) {
                pandora &&
                    pandora.ipcRenderer
                        .invoke('pandora:fileSearch', treeData[0].path, {
                            value,
                            caseSensitive,
                            wholeWord
                        })
                        .then(data => {
                            if (data.status === 0) {
                                setSearchResult(data.data);
                            }
                        });
            }
            setShowPanel(true);
        },
        [setShowPanel, treeData]
    );

    const onToc = React.useCallback(() => {
        const tocList = getMdOutline(editor);
        setTocList(tocList);
        // 用于切换大纲和文件列表
        setShowToc(!showToc);
    }, [showToc, editor, setTocList]);

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
                selectedFilePath === path &&
                    dispatch({
                        type: 'selectedFile',
                        payload: selectedFile
                    });
                setTreeData(nextTree as any);
            }
        });
    }, [treeData, selectedFilePath]);

    const fsRename = React.useCallback(
        (key: string) => {
            dispatch({
                type: 'selectedFile',
                payload: key
            });
            setRenameKey(key);
        },
        [setRenameKey]
    );

    React.useEffect(() => {
        fileEvent.on(FS_EDIT, fsRename);
        return () => {
            fileEvent.off.bind(null, FS_EDIT, fsRename);
        };
    }, []);

    const immerTreeData = React.useCallback(
        (nodeKey: string, name: string) => {
            if (treeData.length > 0) {
                setTreeData(
                    produce(treeData, draftTreeData => {
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
                    })
                );
            }
        },
        [treeData, setTreeData]
    );

    // useCallback 嵌套：内部的callback的依赖是从外层callback获取的，所以这里需要声明treeData
    const onRename = React.useCallback(
        (oldPath: string, newName: string, nodeData: Record<string, any>) => {
            if (!pandora) {
                return Promise.reject();
            }
            if (nodeData.type === 'file') {
                const content = editor?.getDoc().getValue() || '';
                return pandora.ipcRenderer
                    .invoke('pandora:renameFile', oldPath, newName, content)
                    .then(res => {
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
                    })
                    .catch(err => {
                        console.log(err);
                    });
            } else if (nodeData.type === 'directory') {
                return pandora.ipcRenderer
                    .invoke('pandora:renameDir', oldPath, newName)
                    .then(res => {
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
                    })
                    .catch(err => {
                        console.log(err);
                    });
            }
        },
        [treeData, dispatch]
    );

    return (
        <div
            className={className}
            ref={ref}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className="pandora-sider-container" data-context="sider">
                <div className="sider-title">
                    {mouseEnter && (
                        <span onClick={onToc} className="sider-title-icon sider-title-list" title="大纲/列表">
                            <Icon type="list" style={{fontSize: '20px'}} />
                        </span>
                    )}
                    <div className="sider-title-text">{showToc ? '大纲' : '文件'}</div>
                    {mouseEnter && (
                        <span onClick={onShowPanel} className="sider-title-icon sider-title-search" title="查找">
                            <Icon type="search" style={{fontSize: '20px'}} />
                        </span>
                    )}
                </div>
                {showPanel && (
                    <div className="sider-panel">
                        <Header focused={showPanel} onPressEnter={onStartSearch} onBack={onShowPanel} />
                        {searchResult.length > 0 ?
                            <SearchList
                                data={searchResult}
                                className="sider-panel-content"
                                onSelect={onSearchSelect}
                                onLineSelect={onLineSelect}
                            />
                            : <div className="sider-panel-empty">没有匹配结果</div>
                        }
                    </div>
                )}
                {showToc && (
                    <div className="sider-toc">
                        {
                            tocList.length > 0
                                ? <TocList data={tocList} onSelect={onTocSelect} />
                                : <div className="sider-toc-empty">没有大纲</div>
                        }
                    </div>
                )}
                {treeData.length > 0 ?
                    <FileFolder
                        data-context="sider"
                        className={`sider-file-folder ${showToc ? 'sider-file-folder-hide' : ''}`}
                        treeData={treeData}
                        onRename={onRename}
                        onSelect={onSelect}
                        renameKey={renameKey}
                        selectedFilePath={selectedFilePath}
                        expandAction="click"
                        defaultExpandedKeys={[treeData[0].path]}
                    />
                    : <div className="sider-file-empty">没有打开的文件夹</div>
                }
                {mouseEnter && !showToc && (
                    <div className="sider-footer" onClick={getTreeData}>
                        打开文件夹...
                    </div>
                )}
            </div>
        </div>
    );
});
