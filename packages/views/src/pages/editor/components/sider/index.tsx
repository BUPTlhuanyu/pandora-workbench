import * as React from 'react';
import './index.scss';
import getClassname from 'views/src/utils/classMaker';
import FileFolder, {ItreeData} from 'views/src/components/file-folder';
import Icon from 'views/src/components/icon';
import {taotie} from 'views/src/services/taotie';
import {FS_CREATE_FILE, FS_CREATE_DIR, fileEvent} from 'views/src/utils/event';
import {Input} from 'antd';
import {EditorContext} from 'views/src/pages/editor/editor-store';

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
    let item = null;
    for (let root of tree) {
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
                return item;
            }
            node = node.children;
        }
    }
}

export default React.forwardRef(function Sider(props: ISiderProps, ref: any) {
    const contextRef = React.useRef<boolean>(false);
    const [{selectedFilePath}, dispatch] = React.useContext(EditorContext);
    const [treeData, setTreeData] = React.useState<ItreeData>([]);
    const [mouseEnter, setMouseEbter] = React.useState<boolean>(false);
    const [showPanel, setShowPanel] = React.useState<boolean>(false);
    const [caseSensitive, setCaseSensitive] = React.useState<boolean>(false);
    const [wholeWord, setWholeWord] = React.useState<boolean>(false);
    const [className] = React.useState(() => {
        return getClassname({
            'taotie-sider-wrapper': true,
            [props.className]: true
        });
    });
    const onRename = React.useCallback(() => {
        const root = treeData[0];
        if (!root.path) {
            return;
        }
        taotie &&
            taotie.ipcRenderer.invoke('taotie:getDirFiles', root.path).then(newTreeData => {
                newTreeData && setTreeData(newTreeData as ItreeData);
            });
    }, [treeData[0], setTreeData]);

    const onMouseEnter = React.useCallback(() => {
        if (!contextRef.current) {
            console.log('onMouseEnter');
            setMouseEbter(true);
        } else {
            contextRef.current = false;
        }
    }, [setMouseEbter]);

    const onMouseLeave = React.useCallback(() => {
        if (!contextRef.current) {
            console.log('onMouseLeave');
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
        fileEvent.on(FS_CREATE_FILE, () => {
            console.log('FS_CREATE_FILE', treeData, selectedFilePath);
            let rootDir = selectedFilePath ? selectedFilePath : treeData[0].path;
            if (!rootDir) {
                return;
            }
            rootDir = getRootPath(rootDir);
            contextRef.current = true;
            // treeData 插入
            const newTreeData = treeData.slice(0);
            const newFile = addToTreeData(newTreeData, rootDir);
            if (newFile) {
                dispatch({
                    type: 'selectedFile',
                    payload: newFile.key
                });
                setTreeData(newTreeData);
            }
        });
        fileEvent.on(FS_CREATE_DIR, () => {
            console.log('FS_CREATE_DIR', treeData);
        });
        return fileEvent.removeAllListeners.bind(fileEvent);
    }, [treeData, selectedFilePath]);

    console.log('Sider update');
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
                <FileFolder className="sider-file-folder" treeData={treeData} onRename={onRename} />
                {mouseEnter && (
                    <div className="sider-footer" onClick={getTreeData}>
                        打开文件夹...
                    </div>
                )}
            </div>
        </div>
    );
});
