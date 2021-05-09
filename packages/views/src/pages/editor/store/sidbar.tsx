/**
 * @file 用于管理文件系统状态
 */
import * as React from 'react';

export interface IStoreState {
    sidbarOpened: boolean;
}

export interface IAction {
    type: string;
    payload: any;
}

export const initState: IStoreState = {
    sidbarOpened: false
};

/**
 * reducer
 * @param state
 * @param action
 */
function reducer(state: IStoreState, action: IAction) {
    switch (action.type) {
        case 'sidbarStatus':
            return {...state, sidbarOpened: !state.sidbarOpened};
        case 'selectedFile':
            return {...state, selectedFilePath: action.payload};
        default:
            return state;
    }
}

export const FileContext = React.createContext<any>(null);

export default function EditorStore(props: any) {
    const sidbarState = React.useReducer(reducer, initState);
    return (
        <FileContext.Provider value={sidbarState}>
            {props.children}
        </FileContext.Provider>
    );
}
