/**
 * @file
 */
import React, {useEffect, useState} from 'react';
import {getMd} from 'core/md';
import './index.scss';

interface MdViewProps {
    className?: string;
    value: string;
}

let md = getMd('wx', {html: true});

export default function MdView(props: MdViewProps) {
    const [mdString, setMdString] = useState<string>('');
    useEffect(() => {
        setMdString(md.render(props.value));
    }, [props.value]);
    return (
        <div
            className={props.className}
            dangerouslySetInnerHTML={{__html: mdString}}
        ></div>
    );
}

MdView.defaultProps = {
    className: '',
    value: ''
};
