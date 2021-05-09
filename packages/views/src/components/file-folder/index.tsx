import * as React from 'react';

import Title from './title';
import {Tree} from 'antd';
const {DirectoryTree} = Tree;

export interface IFileData {
    title: React.ReactNode;
    key: string | number;
    isLeaf: boolean;
    exist?: boolean;
    path?: string;
    [key: string]: any;
}
export interface IDirData {
    title: React.ReactNode;
    exist?: boolean;
    key: string | number;
    path?: string;
    children: IFileData[] | IDirData[];
    [key: string]: any;
}
export type ItreeData = Array<IDirData | IFileData> | [];

function FileFolder(props: any) {
    const [expandedKeys, setExpandedKeys] = React.useState<string[]>([]);
    // 计算需要展开的文件
    React.useEffect(() => {
        let keys = [];
        let root = props.treeData[0];
        if (root) {
            let stack: Record<string, any> = [root];
            while (stack.length > 0) {
                let node = stack.pop();
                let key = '';
                if (node.children && node.children.length > 0) {
                    key = node.key;
                    let len = node.children.length;
                    for (let i = 0; i < len; i++) {
                        stack.push(node.children[i]);
                    }
                }
                if (!props.selectedFilePath || props.selectedFilePath.indexOf(node.path) > -1) {
                    keys.push(key);
                }
            }
            setExpandedKeys(keys);
        }
    }, [props.selectedFilePath, props.treeData]);

    return (
        <DirectoryTree
            className={props.className}
            multiple
            expandAction="doubleClick"
            expandedKeys={expandedKeys}
            titleRender={
                node =>
                    (<Title
                        nodeData={node}
                        rename={props.renameKey === node.key && props.selectedFilePath === props.renameKey}
                        key={node.key}
                        onRename={props.onRename}
                        onBlur={props.onBlur}
                        onKeyPress={props.onKeyPress}
                    />)
            }
            selectedKeys={[props.selectedFilePath]}
            {...props}
        />
    );
}

FileFolder.defaultProps = {
    treeData: []
};

export default React.memo(FileFolder);
