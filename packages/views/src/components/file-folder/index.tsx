import * as React from 'react';
import {EditorContext} from '../../pages/editor/editor-store';

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

// const treeData: ItreeData = [
//     {
//         title: 'parent 0',
//         key: '0-0',
//         children: [
//             {title: 'leaf 0-0', key: '0-0-0', isLeaf: true}
//         ]
//     }
// ];

function FileFolder(props: any) {
    const [{selectedFilePath}, dispatch] = React.useContext(EditorContext);
    const [expandedKeys, setExpandedKeys] = React.useState<string[]>([]);
    const onSelect = React.useCallback((keys: Array<string | number>, {node}: Record<string, any>) => {
        dispatch({
            type: 'selectedFile',
            payload: keys[0] || node.path
        });
    }, [dispatch]);

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
                if (!selectedFilePath || selectedFilePath.indexOf(node.path) > -1) {
                    keys.push(key);
                }
            }
            setExpandedKeys(keys);
        }
    }, [selectedFilePath, props.treeData]);

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
                        key={node.key}
                        onRename={props.onRename}
                        selectedFilePath={selectedFilePath}
                    />)
            }
            selectedKeys={[selectedFilePath]}
            onSelect={onSelect}
            {...props}
        />
    );
}

FileFolder.defaultProps = {
    treeData: []
};

export default FileFolder;
