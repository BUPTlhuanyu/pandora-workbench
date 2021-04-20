import * as React from 'react';
import {EditorContext} from '../../pages/editor/editor-store';

import Title from './title';
import {Tree} from 'antd';
const {DirectoryTree} = Tree;

export interface IFileData {
    title: React.ReactNode;
    key: string | number;
    isLeaf: boolean;
    path?: string;
    [key: string]: any;
}
export interface IDirData {
    title: React.ReactNode;
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
    const onSelect = React.useCallback((keys: Array<string | number>, {node}: Record<string, any>) => {
        dispatch({
            type: 'selectedFile',
            payload: keys[0] || node.path
        });
    }, [dispatch]);
    console.log('FileFolder update');
    return (
        <DirectoryTree
            className={props.className}
            multiple
            expandAction="doubleClick"
            defaultExpandAll
            titleRender={
                node =>
                    (<Title
                        nodeData={node}
                        key={node.key}
                        onRename={props.onRename}
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
