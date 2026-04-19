import {message} from 'ant-design-vue';

export const success = (msg: string) => {
    message.success({
        content: msg,
        duration: 1,
        class: 'pandora-message-success'
    });
};

export const error = (msg: string) => {
    message.error({
        content: msg,
        duration: 1,
        class: 'pandora-message-success'
    });
};
