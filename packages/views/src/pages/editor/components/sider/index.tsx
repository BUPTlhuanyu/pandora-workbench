import * as React from 'react';
import './index.scss';
import getClassname from 'views/src/utils/classMaker';
import FileFolder, {ItreeData} from 'views/src/components/file-folder';

// TODO: 依赖注入不同环境的处理方式
import {remote} from 'electron';
import {directoryTree, IOnEachFile, IOnEachDirectory} from 'shared/utils/file';

interface ISiderProps {
    className: string;
}

const onEachFile: IOnEachFile = (item: Record<string, any>) => {
    item.key = item.path;
    item.title = item.name;
    item.isLeaf = true;
};
const onEachDirectory: IOnEachDirectory = (item: Record<string, any>) => {
    if (item.children.length === 0) {
        item.isLeaf = true;
    }
    item.key = item.path;
    item.title = item.name;
};

export default React.forwardRef(function Sider(props: ISiderProps, ref: any) {
    const [treeData, setTreeData] = React.useState<ItreeData>([]);
    const [className] = React.useState(() => {
        return getClassname({
            'taotie-sider-wrapper': true,
            [props.className]: true
        });
    });
    async function openDialog() {
        const result = await remote.dialog.showOpenDialog({
            properties: [
                'openFile',
                'openDirectory',
                'createDirectory' // macOS only
            ],
        });
        if (!result.canceled && result.filePaths) {
            const files = directoryTree(
                result.filePaths[0],
                {excludeHidden: true},
                onEachFile,
                onEachDirectory
            );
            const treeData = files ? [files] : [];
            setTreeData(treeData as ItreeData);
        }
    }
    return (
        <div className={className} ref={ref}>
            <div className="taotie-sider-container">
                <div className="sider-title">
                    <div></div>
                    <div onClick={openDialog}>文件</div>
                    <div></div>
                </div>
                <FileFolder
                    className="sider-file-folder"
                    treeData={treeData}
                />
            </div>
        </div>
    );
});
