import './editor.scss';

import React, {useRef, useEffect, useCallback, useState, useContext} from 'react';
import {useMount} from 'ahooks';
import useCodemirror, {CodemirrorObj} from '../../components/useCodemirror';
import {FileContext} from './store/sidbar';
import {EditorContext} from 'views/src/pages/editor/store/editor';

import SplitPane, {Pane} from 'react-split-pane';
import Sider from './components/sider';
import MdView from '../../components/md-view';
import ToolBar from './components/tool-bar';
import Footer from './components/footer';

import {success, error} from 'views/src/utils/message';
import {isFilePath} from 'views/src/utils/tools';

import {fileEvent, FS_SAVE} from 'views/src/utils/event';
import {pandora} from 'views/src/services/pandora';

import {blobToBase64, getFileName} from 'shared/utils/img';
import {uploader} from 'shared/utils/chunk';
import {PROTOCOL_IMG} from 'shared/common/constant';

function Editor() {
    const [storeState] = useContext(FileContext);
    const {
        code,
        setCode,
        setCodemirrorEle,
        scroll: coScroll,
        editor,
        count
    } = useCodemirror();

    /* -------------------------------------------------------------------------- */
    /*                                 handle pic                                 */
    /* -------------------------------------------------------------------------- */
    const [, dispatch] = useContext(EditorContext);
    useEffect(() => {
        dispatch({
            type: 'storeeditor',
            payload: editor
        });
        if (editor) {
            // @ts-ignore
            editor.on('paste', (instance: CodemirrorObj['editor'], e: ClipboardEvent) => {
                if (e.clipboardData && e.clipboardData.items) {
                    const items = e.clipboardData.items;
                    for (let i = 0, len = items.length; i < len; i++) {
                        let item = items[i];
                        if (item.kind !== 'file') {
                            return;
                        }
                        let pasteFile = item.getAsFile();
                        if (!pasteFile) {
                            return;
                        }
                        if (pasteFile.size > 0 && pasteFile.type.match('^image/')) {
                            blobToBase64(pasteFile).then(data => {
                                const imageName = getFileName();
                                // 拒绝压缩
                                uploader({
                                    send(data: any) {
                                        pandora.ipcRenderer.invoke('pandora:storeImage', {
                                            name: imageName,
                                            base64: data
                                        }).then((res: {success: boolean, data: string}) => {
                                            const doc = editor.getDoc();
                                            const curs = doc.getCursor();
                                            doc.replaceRange(
                                                `<img src="${PROTOCOL_IMG}:\/\/${res.data}" width="100%" height="100%" />`,
                                                {line: curs.line, ch: curs.ch}
                                            );
                                        }).catch(err => {
                                            console.warn(err);
                                        });
                                    }
                                }, data as string);
                            }).catch(error => {
                                console.log(error);
                            });
                        }
                        return;
                    }
                }
            });
        }
    }, [editor]);

    /* -------------------------------------------------------------------------- */
    /*                                    侧边栏展开                               */
    /* -------------------------------------------------------------------------- */
    const sideRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        if (sideRef && sideRef.current) {
            sideRef.current.style.width = storeState.sidbarOpened ? '30%' : '0px';
        }
    }, [storeState.sidbarOpened, sideRef.current]);

    /* -------------------------------------------------------------------------- */
    /*                                    文件操作                                 */
    /* -------------------------------------------------------------------------- */
    const scrollTarget = useRef<number>(-1);
    const [mdScroll, setMdScroll] = useState<any>({
        scrollTop: 0,
        scrollHeight: 0
    });
    // 获取文件code.TODO: 确保组件没有卸载
    useEffect(() => {
        if (isFilePath(storeState.selectedFilePath) && pandora) {
            pandora.ipcRenderer.invoke('pandora:readFile', storeState.selectedFilePath).then((resStr: string) => {
                setCode(resStr);
                editor?.getDoc().setValue(resStr);
            }).catch(err => {
                console.warn(err);
            });
        } else {
            setCode('');
            editor?.getDoc().setValue('');
        }
    }, [storeState.selectedFilePath, setCode, editor]);

    // 保存文件内容
    const saveFileCb = useCallback(async () => {
        const content = editor?.getDoc().getValue() || '';
        if (!storeState.selectedFilePath) {
            // TODO：保存文件弹窗
            error('保存文件失败');
            return;
        }
        // TODO:错误处理
        pandora && pandora.ipcRenderer.invoke('pandora:writeFile', storeState.selectedFilePath, content).then(() => {
            success('保存文件成功');
        }).catch(err => {
            console.log(err);
        });
    }, [storeState.selectedFilePath]);

    // 监听保存文件内容的事件 TODO: saveFileCb 会一直变化
    useEffect(() => {
        fileEvent.removeAllListeners(FS_SAVE);
        fileEvent.on(FS_SAVE, saveFileCb);
    }, [saveFileCb]);

    /* -------------------------------------------------------------------------- */
    /*                                    滚动相关                                 */
    /* -------------------------------------------------------------------------- */
    const mdRef = useRef<HTMLDivElement | null>(null);
    const editorRef: React.RefObject<HTMLDivElement> = useRef(null);
    useMount(() => {
        setCodemirrorEle(editorRef.current as Element);
        const ele = mdRef.current;
        if (ele) {
            ele.addEventListener('scroll', mdScrollHandler);
            ele.addEventListener('mouseover', mdMouseHandler);
        }
        return () => {
            mdRef.current?.removeEventListener('scroll', mdScrollHandler);
            mdRef.current?.removeEventListener('mouseover', mdMouseHandler);
        };
    });

    const mdScrollHandler = useCallback(
        (evt: any) => {
            let {scrollTop, scrollHeight} = evt.target;
            setMdScroll({scrollTop, scrollHeight});
        },
        [],
    );
    const mdMouseHandler = useCallback(
        () => {
            scrollTarget.current = 1;
        },
        [scrollTarget],
    );
    const getCoViewEle = useCallback(
        (ele: HTMLDivElement) => {
            ele && ele.addEventListener('mouseover', () => {
                scrollTarget.current = 0;
            });
        },
        []
    );

    useEffect(() => {
        const layerDom = mdRef.current;
        let mdScrollHeight = layerDom!.scrollHeight - layerDom!.clientHeight;
        let coScrollHeight = coScroll.scrollHeight - coScroll.clientHeight;
        if (scrollTarget.current === 1) {
            let coScrollTop = mdScroll.scrollTop / mdScrollHeight * coScrollHeight;
            editor && editor.scrollTo(null, coScrollTop);
        }
        else {
            let mdScrollTop = coScroll.scrollTop / coScrollHeight * mdScrollHeight;
            mdRef.current && mdRef.current.scrollTo(0, mdScrollTop);
        }
    }, [
        coScroll.scrollTop,
        coScroll.scrollHeight,
        coScroll.clientHeight,
        mdScroll.scrollTop,
        mdScroll.scrollHeight,
        editor
    ]);

    return (
        <div className="pandora-editor">
            {
                pandora && <Sider
                    className="editor-file-folder"
                    ref={sideRef}
                />
            }
            <div className="editor-container">
                <ToolBar />
                <div className="editor-wrapper">
                    <SplitPane
                        split="vertical"
                        defaultSize="50%"
                        paneStyle={{overflow: 'auto'}}
                        style={{position: 'relative'}}
                    >
                        <Pane
                            eleRef={getCoViewEle}
                            className="md-editor-wrapper"
                            style={{height: '100%'}}
                        >
                            <div
                                ref={editorRef}
                                className="md-editor-container"
                            ></div>
                        </Pane>
                        <Pane className="md-view-wrapper">
                            <div ref={mdRef} className="md-view-layer">
                                <MdView
                                    value={code}
                                    className="md-view-container"
                                />
                            </div>
                            <div className="iphone-frame"></div>
                        </Pane>
                    </SplitPane>
                </div>
                <Footer count={count} />
            </div>
        </div>
    );
}

export default Editor;
