/**
 * @file 用于管理编辑器状态
 */
import * as React from 'react';
export interface IStoreState {
    editor: Record<string, any> | null;
}

export interface IAction {
    type: string;
    payload: any;
}

export const initState: IStoreState = {
    editor: null
};

function reducer(state: IStoreState, action: IAction) {
    switch (action.type) {
        case 'storeeditor':
            return {...state, editor: action.payload};
        default:
            return state;
    }
}

export const EditorContext = React.createContext<any>(null);

export default function EditorStore(props: any) {
    const sidbarState = React.useReducer(reducer, initState);
    return <EditorContext.Provider value={sidbarState}>{props.children}</EditorContext.Provider>;
}
