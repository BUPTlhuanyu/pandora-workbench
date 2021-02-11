/**
 * @file
 */
import React, {useReducer, useRef} from 'react';
import './index.scss';

import {useUpdateEffect} from 'ahooks';

export interface MessageOptions {
    text: string;
    type?: string;
    duration?: number;
    key?: string;
}

interface TipProps {
    message: MessageOptions | null;
}

let fakeKey: number = 0;
const defaultDuration: number = 800;

interface IAction {
    type: string;
    payload?: {
        message: MessageOptions;
        deadTime: number;
        key: string;
    };
}

function reducer(state: any, action: IAction) {
    switch (action.type) {
        case 'increment': {
            let curTime = Date.now();
            let newList = state.filter((payload: IAction['payload']) => payload && payload.deadTime > curTime);
            return [...newList, action.payload];
        }
        case 'decrement': {
            let curTime = Date.now();
            let newList = state.filter((payload: IAction['payload']) => payload && payload.deadTime > curTime);
            return [...newList];
        }
        default:
            throw new Error();
    }
}

export default function Tip(props: TipProps) {
    const [list, dispatch] = useReducer(reducer, []);
    // 这里不用useState，闭包的原因会导致setTimeout拿不到最新的最大值
    const maxDuration = useRef<number>(defaultDuration * 2);
    // eslint-disable-next-line
    const timer = useRef<NodeJS.Timeout | null>(null);
    useUpdateEffect(() => {
        let curTime = Date.now();
        if (props.message) {
            if (props.message.duration !== undefined && props.message.duration > maxDuration.current) {
                maxDuration.current = props.message.duration + 100;
            }
            let key = props.message.key === undefined ? `${++fakeKey}` : props.message.key;
            dispatch({
                type: 'increment',
                payload: {
                    message: props.message,
                    deadTime: props.message.duration ? props.message.duration + curTime : defaultDuration + curTime,
                    key
                }
            });
            if (timer.current) {
                clearTimeout(timer.current);
            }
            timer.current = setTimeout(() => {
                dispatch({
                    type: 'decrement'
                });
            }, maxDuration.current);
        }
    }, [props.message]);
    return (
        <div>
            {list.length > 0
                ? list.map((item: IAction['payload']) => {
                    return (
                        item ? <div className="taotie-message-wrapper taotie-message-animation-begin" key={item.key}>
                            {item.message.text}
                        </div> : null
                    );
                })
                : null}
        </div>
    );
}

Tip.defaultProps = {
    text: '发生啥了'
};
