import * as React from 'react';
import './title.scss';

// 注册菜单点击事件
import {fileEvent, FS_EDIT} from '../../utils/event';
import {taotie} from 'views/src/services/taotie';

/**
 * TODO: file service
 * @param oldPath
 * @param newPath
 * @param callBack
 */
function rename(oldPath: string, newPath: string, callBack: () => void) {
    taotie && taotie.ipcRenderer.invoke(
        'taotie:renameFile',
        oldPath,
        newPath
    ).then(res => {
        // TODO: 数据格式
        if (res.success) {
            callBack();
        }
    }).catch(err => {
        console.log(err);
    });
}

interface ITitileProps {
    nodeData: {
        title?: React.ReactNode;
        type?: string;
        key: string | number;
        path?: string;
        name?: string;
    };
    onRename: (data: Record<string, any>) => void;
}

function Title(props: ITitileProps) {
    const [inputShow, setInputShow] = React.useState<boolean>(false);
    const [title, setTitle] = React.useState<React.ReactNode>(props.nodeData.title);
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const isMouted = React.useRef<boolean>(false);

    // 重命名
    const fsRename = React.useCallback((key: string | number) => {
        if (props.nodeData.key === key && isMouted.current) {
            setInputShow(true);
            if (inputRef.current) {
                inputRef.current.value = typeof props.nodeData.title === 'string' ? props.nodeData.title : '';
                inputRef.current.focus();
            }
        }
    }, [setInputShow]);

    React.useEffect(() => {
        isMouted.current = true;
        fileEvent.on(FS_EDIT, fsRename);
        return () => {
            isMouted.current = false;
            fileEvent.off.bind(null, FS_EDIT, fsRename);
        };
    }, []);

    const onKeyPress = React.useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            // 去修改文件名
            // 成功之后需要将文字设置一下，失败了则不设置
            // setInputShow(false);
            const newName = inputRef.current && inputRef.current.value.trim();
            if (newName && props.nodeData.path) {
                rename(
                    props.nodeData.path,
                    newName,
                    () => {
                        setTitle(newName);
                        setInputShow(false);
                        props.onRename && props.onRename(props.nodeData);
                    }
                );
            }
        }
    }, [setInputShow, setTitle, inputRef.current]);

    const onBlur = React.useCallback(() => {
        if (inputRef.current && inputRef.current.value.trim() && props.nodeData.path) {
            const newName = inputRef.current.value.trim();
            rename(
                props.nodeData.path,
                newName,
                () => {
                    setTitle(newName);
                    setInputShow(false);
                    props.onRename && props.onRename(props.nodeData);
                }
            );
        }
    }, [setInputShow, setTitle, inputRef.current]);

    return (
        <>
            <span
                data-key={props.nodeData.key}
                data-context={props.nodeData.type}
                style={{display: !inputShow ? 'unset' : 'none'}}
                className="ant-tree-title-text"
            >
                {title}
            </span>
            <input
                ref={inputRef}
                onBlur={onBlur}
                style={{display: inputShow ? 'unset' : 'none'}}
                className="ant-tree-title-search-input"
                onKeyPress={onKeyPress}
            />
        </>
    );
}

export default Title;
