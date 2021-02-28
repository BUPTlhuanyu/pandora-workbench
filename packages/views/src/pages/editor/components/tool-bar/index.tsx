/**
 * @file
 */
import React, {useRef, useEffect, useState, useCallback, useContext} from 'react';
import './index.scss';
import ClipboardJS from 'clipboard';
import {EditorContext} from '../../editor-store';

import Message, {MessageOptions} from '../../../../components/message';
import Icon from '../../../../components/icon';

export default function () {
    const copyBtn = useRef<HTMLDivElement | null>(null);
    const [, dispatch] = useContext(EditorContext);
    const [messageOption, setMessage] = useState<MessageOptions | null>(null);
    useEffect(() => {
        let cpIns = new ClipboardJS(copyBtn.current as HTMLDivElement, {
            target: () => document.querySelector('.md-view-wrapper') as HTMLDivElement
        });
        cpIns.on('success', function () {
            setMessage({
                text: '复制成功'
            });
        });
        cpIns.on('error', function () {
            setMessage({
                text: '复制失败'
            });
        });
    }, []);
    const changeSidebarStatus = useCallback(() => {
        dispatch({
            type: 'sidbarStatus',
            payload: ''
        });
    }, []);
    return (
        <div className="tool-bar-wrapper">
            <div className="tool-bar-content">
                <div className="tool-bar-title">Taotie Markdown</div>
                <div className="tool-bar-icon-group">
                    <div
                        className="tool-bar-icon"
                        ref={copyBtn}
                        title="复制"
                    >
                        <Icon type="copy" style={{fontSize: '20px'}} />
                    </div>
                    <div
                        className="tool-bar-icon"
                        title="undo"
                    >
                        <Icon type="undo" style={{fontSize: '20px'}} />
                    </div>
                    <div
                        className="tool-bar-icon"
                        title="redo"
                    >
                        <Icon type="redo" style={{fontSize: '20px'}} />
                    </div>
                    <div
                        className="tool-bar-icon"
                        title="side bar"
                        onClick={changeSidebarStatus}
                    >
                        <Icon type="sideBar" style={{fontSize: '20px'}} />
                    </div>
                    <div
                        className="tool-bar-icon"
                        title="file"
                    >
                        <Icon type="file" style={{fontSize: '20px'}} />
                    </div>
                </div>
            </div>
            <Message message={messageOption} />
        </div>
    );
}
