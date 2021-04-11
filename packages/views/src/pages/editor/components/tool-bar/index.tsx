/**
 * @file
 */
import React, {useRef, useEffect, useCallback, useContext} from 'react';
import './index.scss';
import ClipboardJS from 'clipboard-web';
import {EditorContext} from '../../editor-store';

import {message} from 'antd';

import Icon from '../../../../components/icon';

import {fileEvent, FS_SAVE} from '../../../../utils/event';

export default function () {
    const copyBtn = useRef<HTMLDivElement | null>(null);
    const [, dispatch] = useContext(EditorContext);
    useEffect(() => {
        let cpIns = new ClipboardJS(copyBtn.current as HTMLDivElement, {
            target: () => document.querySelector('.md-view-wrapper') as HTMLDivElement
        });
        cpIns.on('success', function () {
            message.success({
                content: '复制成功',
                duration: 1,
                className: 'taotie-message-success'
            });
        });
        cpIns.on('error', function () {
            message.error({
                content: '复制失败',
                duration: 1,
                className: 'taotie-message-error'
            });
        });
    }, []);
    const changeSidebarStatus = useCallback(() => {
        dispatch({
            type: 'sidbarStatus',
            payload: ''
        });
    }, []);
    const saveFile = useCallback(() => {
        fileEvent.emit(FS_SAVE);
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
                    {/* <div
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
                    </div> */}
                    <div
                        className="tool-bar-icon"
                        title="side bar"
                        onClick={changeSidebarStatus}
                    >
                        <Icon type="sideBar" style={{fontSize: '20px'}} />
                    </div>
                    {/* <div
                        className="tool-bar-icon"
                        title="file"
                    >
                        <Icon type="file" style={{fontSize: '20px'}} />
                    </div> */}
                    <div
                        className="tool-bar-icon"
                        title="save"
                        onClick={saveFile}
                    >
                        <Icon type="save" style={{fontSize: '20px'}} />
                    </div>
                </div>
            </div>
        </div>
    );
}
