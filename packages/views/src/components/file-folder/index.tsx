import * as React from 'react';
import Title from './title';
import {Tree} from 'antd';
const {DirectoryTree} = Tree;

export interface IFileData {
    title: React.ReactNode;
    key: string | number;
    isLeaf: boolean;
    [key: string]: any;
}
export interface IDirData {
    title: React.ReactNode;
    key: string | number;
    children: IFileData[] | IDirData[];
    [key: string]: any;
}
export type ItreeData = Array<IDirData | IFileData> | [];

// const treeData: ItreeData = [
//     {
//         title: 'parent 0',
//         key: '0-0',
//         children: [
//             {title: 'leaf 0-0', key: '0-0-0', isLeaf: true},
//             {title: 'leaf 0-1', key: '0-0-1', isLeaf: true}
//         ]
//     },
//     {
//         title: 'parent 1',
//         key: '0-1',
//         children: [
//             {title: 'leaf 1-0', key: '0-1-0', isLeaf: true},
//             {title: 'leaf 1-1', key: '0-1-1', isLeaf: true}
//         ]
//     }
// ];

function FileFolder(props: any) {
    return (
        <DirectoryTree
            className={props.className}
            multiple
            expandAction="doubleClick"
            defaultExpandAll
            titleRender={node => <Title nodeData={node} key={node.key} />}
            {...props}
        />
    );
}

FileFolder.defaultProps = {
    treeData: []
};

export default FileFolder;
