import * as React from 'react';
import './title.scss';

// 注册菜单点击事件
import {fileEvent, FS_REANEM} from '../../electron/menu/file';

interface ITitileProps {
    nodeData: {
        title?: React.ReactNode;
        type?: string;
        key: string | number;
    };
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
            inputRef.current && inputRef.current.focus();
        }
    }, [setInputShow]);

    React.useEffect(() => {
        isMouted.current = true;
        fileEvent.on(FS_REANEM, fsRename);
        return () => {
            isMouted.current = false;
            fileEvent.off.bind(null, FS_REANEM, fsRename);
        };
    }, []);

    const onKeyPress = React.useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            setInputShow(false);
            if (inputRef.current && inputRef.current.value.trim()) {
                setTitle(inputRef.current.value);
            }
        }
    }, [setInputShow, setTitle, inputRef.current]);

    const onBlur = React.useCallback(() => {
        setInputShow(false);
        if (inputRef.current && inputRef.current.value.trim()) {
            setTitle(inputRef.current.value);
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
