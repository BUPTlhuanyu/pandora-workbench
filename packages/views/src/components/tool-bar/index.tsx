/**
 * @file
 */
import React, {useRef, useEffect, useState} from 'react';
import './index.scss';
import ClipboardJS from 'clipboard';
import Message, {MessageOptions} from '../message';
import Icon from '../icon';

export default function () {
    const copyBtn = useRef<HTMLDivElement | null>(null);
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
    return (
        <div className="tool-bar-wrapper">
            <div ref={copyBtn} title="复制">
                <Icon type="copy" style={{fontSize: '20px'}} />
            </div>
            <Message message={messageOption} />
        </div>
    );
}
