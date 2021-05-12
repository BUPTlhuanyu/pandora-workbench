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
    // const ref = React.useRef<HTMLElement>(null);
    // React.useEffect(() => {
    //     if (!props.selectedFilePath) {
    //         console.log('ref', ref);
    //     }
    // }, [props.selectedFilePath]);
    return (
        <DirectoryTree
            className={props.className}
            multiple
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
