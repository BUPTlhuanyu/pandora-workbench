// 非受控，减少外层代码量
import * as React from 'react';
import './index.scss';
import getClassname from '../../../../../utils/class-maker';

import Icon from 'views/src/components/icon';
import {Input} from 'antd';

interface ISiderProps {
    className?: string;
    onBack?: React.MouseEventHandler<HTMLSpanElement>;
    onPressEnter?: (value: string, caseSensitive: boolean, wholeWord: boolean) => void;
    onCaseSensitive?: React.MouseEventHandler<HTMLSpanElement>;
    onCheckWholeWord?: React.MouseEventHandler<HTMLSpanElement>;
    focused?: boolean;
}

export default function Header(props: ISiderProps) {
    const [caseSensitive, setCaseSensitive] = React.useState<boolean>(false);
    const [wholeWord, setWholeWord] = React.useState<boolean>(false);
    const inputRef = React.useRef<Input>(null);

    const [className] = React.useState(() => {
        return getClassname([
            'sider-panel-header',
            props.className
        ]);
    });

    const onCaseSensitive = React.useCallback(() => {
        setCaseSensitive(!caseSensitive);
    }, [caseSensitive, setCaseSensitive, props.onCaseSensitive]);

    const onCheckWholeWord = React.useCallback(() => {
        setWholeWord(!wholeWord);
    }, [wholeWord, setWholeWord, props.onCheckWholeWord]);

    const onPressEnter = React.useCallback(
        e => {
            if (!e || !e.target) {
                return;
            }
            const value = e.target.value;
            typeof props.onPressEnter === 'function' && props.onPressEnter(value, caseSensitive, wholeWord);
        },
        [props.onPressEnter, caseSensitive, wholeWord]
    );

    React.useEffect(() => {
        props.focused && inputRef.current && inputRef.current?.focus();
    }, [props.focused]);

    return (
        <div className={className}>
            {/* TODO: renderProp */}
            <span className="sider-panel-header-icon sider-panel-header-back" onClick={props.onBack}>
                <Icon type="left" style={{fontSize: '20px'}} />
            </span>
            <Input
                ref={inputRef}
                onPressEnter={onPressEnter}
                placeholder="查找"
                className="sider-panel-header-input"
                suffix={
                    <>
                        <span
                            title="区分大小写"
                            className={`sider-panel-header-icon ${
                                caseSensitive ? 'sider-panel-header-input-selected' : ''
                            }`}
                            onClick={onCaseSensitive}
                        >
                            <Icon type="case" style={{fontSize: '20px'}} />
                        </span>
                        <span
                            title="查找整个单词"
                            className={`sider-panel-header-icon ${
                                wholeWord ? 'sider-panel-header-input-selected' : ''
                            }`}
                            onClick={onCheckWholeWord}
                        >
                            <Icon type="word" style={{fontSize: '20px'}} />
                        </span>
                    </>
                }
            />
        </div>
    );
};

function noop() {}
Header.defaultProps = {
    className: '',
    onBack: noop,
    onPressEnter: noop,
    onCaseSensitive: noop,
    onCheckWholeWord: noop,
    focused: noop
};
