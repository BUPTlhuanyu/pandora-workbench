import * as React from 'react';
import './index.scss';
import getClassname from 'views/src/utils/classMaker';
import FileFolder, {ItreeData} from 'views/src/components/file-folder';
import {taotie} from 'views/src/services/taotie';

// TODO: 依赖注入不同环境的处理方式

interface ISiderProps {
    className: string;
}

export default React.forwardRef(function Sider(props: ISiderProps, ref: any) {
    const [treeData, setTreeData] = React.useState<ItreeData>([]);
    const [className] = React.useState(() => {
        return getClassname({
            'taotie-sider-wrapper': true,
            [props.className]: true
        });
    });
    const onRename = React.useCallback(() => {
        // const root = treeData[0];
        // if (!root.path) {
        //     return;
        // }
        // const newTreeData = getDirTree({canceled: false, filePaths: [root.path]});
        // newTreeData && setTreeData(newTreeData as ItreeData);
    }, [treeData[0], setTreeData]);

    const getTreeData = React.useCallback(async () => {
        taotie.ipcRenderer.send('taotie:dialog');
        // const res: any = await openDialog();
        // const treeData = getDirTree(res);
        // treeData && setTreeData(treeData as ItreeData);
    }, []);

    return (
        <div className={className} ref={ref}>
            <div className="taotie-sider-container">
                <div className="sider-title">
                    <div></div>
                    <div onClick={getTreeData}>文件</div>
                    <div></div>
                </div>
                <FileFolder
                    className="sider-file-folder"
                    treeData={treeData}
                    onRename={onRename}
                />
            </div>
        </div>
    );
});
