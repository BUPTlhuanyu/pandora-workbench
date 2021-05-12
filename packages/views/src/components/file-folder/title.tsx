import * as React from 'react';
import './title.scss';

function noop() {}

interface ITitileProps {
    nodeData: {
        title?: React.ReactNode;
        type?: string;
        key: string | number;
        path?: string;
        name?: string;
        exist?: boolean;
    };
    rename: boolean;
    onRename?: (oldPath: string, newPath: string, nodeData: Record<string, any>) => Promise<any>;
    onBlur?: (data: string) => Promise<any>;
    onKeyPress?: (data: string) => Promise<any>;
}

function Title(props: ITitileProps) {
    const [inputShow, setInputShow] = React.useState<boolean>(false);
    const [title, setTitle] = React.useState<React.ReactNode>(props.nodeData.title);
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const isMouted = React.useRef<boolean>(false);

    React.useEffect(() => {
        isMouted.current = true;
        if (props.rename) {
            setInputShow(true);
            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.value = typeof props.nodeData.title === 'string' ? props.nodeData.title : '';
                    inputRef.current.focus();
                }
            }, 0);
        } else {
            setInputShow(false);
        }
        return () => {
            isMouted.current = false;
        };
    }, [props.rename]);

    React.useEffect(() => {
        if (!props.nodeData.exist) {
            setInputShow(true);
            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.value = typeof props.nodeData.title === 'string' ? props.nodeData.title : '';
                    inputRef.current.focus();
                }
            }, 60);
        }
    }, [props.nodeData.exist]);

    const onKeyPress = React.useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            // 去修改文件名
            // 成功之后需要将文字设置一下，失败了则不设置
            // setInputShow(false);
            const newName = inputRef.current && inputRef.current.value.trim();
            if (!newName) {
                return;
            }
            if (props.nodeData.path) {
                typeof props.onRename === 'function' && props.onRename(
                    props.nodeData.path,
                    newName,
                    props.nodeData
                ).then((res: string) => {
                    if (!res) {
                        setTitle(props.nodeData.title);
                    } else {
                        setTitle(newName);
                    }
                    setInputShow(false);
                }).catch(err => {
                    console.log(err);
                });
            }
        }
    }, [setInputShow, setTitle, inputRef.current]);

    const onBlur = React.useCallback(() => {
        const newName = inputRef.current && inputRef.current.value.trim();
        if (!newName) {
            return;
        }
        if (props.nodeData.path) {
            typeof props.onRename === 'function' && props.onRename(
                props.nodeData.path,
                newName,
                props.nodeData
            ).then((res: string) => {
                if (!res) {
                    setTitle(props.nodeData.title);
                } else {
                    setTitle(newName);
                }
                setInputShow(false);
            }).catch(err => {
                console.log(err);
            });
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

Title.defaultProps = {
    onRename: noop,
    onBlur: noop,
    onKeyPress: noop
};

export default React.memo(Title);
