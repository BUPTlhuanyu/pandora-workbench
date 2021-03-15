import * as React from 'react';

interface IStoreState {
    sidbarOpened: boolean;
}

interface IAction {
    type: string;
    payload: any;
}

const initState: IStoreState = {
    sidbarOpened: false
};

const EditorContext = React.createContext<any>(null);

/**
 * editor页面的reducer
 * @param state
 * @param action
 */
function editorReducer(state: IStoreState, action: IAction) {
    switch (action.type) {
        case 'sidbarStatus':
            return {...state, sidbarOpened: !state.sidbarOpened};
        case 'selectedFile':
            return {...state, selectedFilePath: action.payload};
        default:
            return {...state};
    }
}

export default function EditorStore(props: any) {
    const store = React.useReducer(editorReducer, initState);
    return (
        <EditorContext.Provider value={store}>
            {props.children}
        </EditorContext.Provider>
    );
}

export {EditorContext};
