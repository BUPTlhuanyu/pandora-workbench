import {message} from 'antd';

export const success = (msg: string) => {
    message.success({
        content: msg,
        duration: 1,
        className: 'taotie-message-success'
    });
};

export const error = (msg: string) => {
    message.error({
        content: msg,
        duration: 1,
        className: 'taotie-message-success'
    });
};
