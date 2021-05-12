import './index.scss';

import React, {useRef, useEffect, useCallback, useState, useContext} from 'react';
import {useMount} from 'ahooks';
import useCodemirror from '../../components/useCodemirror';
import {FileContext} from './store/sidbar';
import {EditorContext} from 'views/src/pages/editor/store/editor';

import SplitPane, {Pane} from 'react-split-pane';
import Sider from './components/sider';
import MdView from '../../components/md-view';
import ToolBar from './components/tool-bar';
import Footer from './components/footer';

import {success, error} from '../../utils/message';
import {isFilePath} from 'views/src/utils/tools';

import {fileEvent, FS_SAVE} from '../../utils/event';
import {taotie} from 'views/src/services/taotie';

function Editor() {
    const [storeState] = useContext(FileContext);
    const [, dispatch] = useContext(EditorContext);
    const editorRef: React.RefObject<HTMLDivElement> = useRef(null);
    let {
        code,
        setCode,
        setCodemirrorEle,
        scroll: coScroll,
        editor,
        count
    } = useCodemirror();
    const mdRef = useRef<HTMLDivElement | null>(null);
    const sideRef = useRef<HTMLDivElement | null>(null);
    const scrollTarget = useRef<number>(-1);
    const containerHeight = useRef<number>(0);
    const [mdScroll, setMdScroll] = useState<any>({
        scrollTop: 0,
        scrollHeight: 0
    });

    useEffect(() => {
        dispatch({
            type: 'storeeditor',
            payload: editor
        });
    }, [editor]);

    useEffect(() => {
        if (sideRef && sideRef.current) {
            sideRef.current.style.width = storeState.sidbarOpened ? '30%' : '0px';
        }
    }, [storeState.sidbarOpened, sideRef.current]);

    // 获取文件code.TODO: 确保组件没有卸载
    useEffect(() => {
        if (isFilePath(storeState.selectedFilePath) && taotie) {
            taotie.ipcRenderer.invoke('taotie:readFile', storeState.selectedFilePath).then((resStr: string) => {
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
        taotie && taotie.ipcRenderer.invoke('taotie:writeFile', storeState.selectedFilePath, content).then(() => {
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

    useEffect(() => {
        let mdScrollHeight = mdRef.current!.clientHeight;
        let coScrollHeight = editor && (editor as any).doc.height;
        // let mdVsCodemirror = mdScrollHeight / coScrollHeight; // 同样容器宽度，不同滚动条高度的比例，e.g.【2 0.5  4 0.75
        let baseHeight: number = containerHeight.current;
        let mdVsCodemirror = (mdScrollHeight / baseHeight - 1) / (coScrollHeight / baseHeight - 1);
        if (scrollTarget.current === 1) {
            let coScrollTop = mdScroll.scrollTop / mdVsCodemirror;
            editor && editor.scrollTo(null, coScrollTop);
        }
        else {
            let parentDom: any = mdRef.current!.parentNode;
            let mdScrollTop = coScroll.scrollTop * mdVsCodemirror;
            parentDom && parentDom.scrollTo(null, mdScrollTop);
        }
    }, [coScroll.scrollTop, coScroll.scrollHeight, mdScroll.scrollTop, mdScroll.scrollHeight, editor]);
    useMount(() => {
        let containerDom = document.querySelector('.editor-wrapper');
        containerHeight.current = containerDom ? containerDom.clientHeight : 0;
        setCodemirrorEle(editorRef.current as Element);
    });
    const getMdViewEle = useCallback(
        (ele: HTMLDivElement) => {
            mdRef.current = ele;
            if (ele && ele.parentNode) {
                ele.parentNode.addEventListener('scroll', (evt: any) => {
                    let {scrollTop, scrollHeight} = evt.target;
                    setMdScroll({scrollTop, scrollHeight});
                });
                ele.addEventListener('mouseover', () => {
                    scrollTarget.current = 1;
                });
            }
        },
        []
    );
    const getCoViewEle = useCallback(
        (ele: HTMLDivElement) => {
            ele && ele.addEventListener('mouseover', () => {
                scrollTarget.current = 0;
            });
        },
        []
    );
    return (
        <div className="taotie-editor">
            {
                taotie && <Sider
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
                            className="code-mirror-wrapper"
                            style={{height: '100%'}}
                        >
                            <div
                                ref={editorRef}
                                className="code-mirror-container"
                            ></div>
                        </Pane>
                        <Pane
                            eleRef={getMdViewEle}
                            className="md-view-wrapper"
                        >
                            <MdView
                                value={code}
                                className="md-view-container"
                            />
                        </Pane>
                    </SplitPane>
                </div>
                <Footer count={count} />
            </div>
        </div>
    );
}

export default Editor;
