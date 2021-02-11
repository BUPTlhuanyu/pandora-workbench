import React, {useRef, useEffect, useCallback, useState} from 'react';

import './app.scss';

import SplitPane, {Pane} from 'react-split-pane';

import useCodemirror from '../components/useCodemirror';
import {useMount} from 'ahooks';

import MdView from '../components/md-view';
import ToolBar from '../components/tool-bar';

function App() {
    const editorRef: React.RefObject<HTMLDivElement> = useRef(null);
    let {code, setCodemirrorEle, scroll: coScroll, editor} = useCodemirror();
    const mdRef = useRef<HTMLDivElement | null>(null);
    const scrollTarget = useRef<number>(-1);
    const containerHeight = useRef<number>(0);
    const [mdScroll, setMdScroll] = useState<any>({
        scrollTop: 0,
        scrollHeight: 0
    });
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
        <div className="app">
            <ToolBar />
            <div className="editor-wrapper">
                <SplitPane
                    split="vertical"
                    defaultSize="50%"
                    paneStyle={{overflow: 'auto'}}
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
        </div>
    );
}

export default App;
