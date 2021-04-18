import * as React from 'react';
import './index.scss';
import getClassname from 'views/src/utils/classMaker';
import FileFolder, {ItreeData} from 'views/src/components/file-folder';
import Icon from 'views/src/components/icon';
import {taotie} from 'views/src/services/taotie';
import {Input} from 'antd';

interface ISiderProps {
    className: string;
}

export default React.forwardRef(function Sider(props: ISiderProps, ref: any) {
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
        setMouseEbter(true);
    }, [setMouseEbter]);

    const onMouseLeave = React.useCallback(() => {
        setMouseEbter(false);
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
