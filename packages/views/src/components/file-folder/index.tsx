import * as React from 'react';
import {Tree} from 'antd';
const {DirectoryTree} = Tree;

const treeData = [
    {
        title: 'parent 0',
        key: '0-0',
        children: [
            {title: 'leaf 0-0', key: '0-0-0', isLeaf: true},
            {title: 'leaf 0-1', key: '0-0-1', isLeaf: true}
        ]
    },
    {
        title: 'parent 1',
        key: '0-1',
        children: [
            {title: 'leaf 1-0', key: '0-1-0', isLeaf: true},
            {title: 'leaf 1-1', key: '0-1-1', isLeaf: true}
        ]
    }
];

function FileFolder(props: any) {
    const onSelect = (keys: React.Key[], info: any) => {
        console.log('Trigger Select', keys, info);
    };

    const onExpand = () => {
        console.log('Trigger Expand');
    };
    return (<DirectoryTree
        className={props.className}
        multiple
        defaultExpandAll
        onSelect={onSelect}
        onExpand={onExpand}
        treeData={treeData}
    />);
}

export default FileFolder;
