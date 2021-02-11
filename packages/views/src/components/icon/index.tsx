import React from 'react';

import './index.scss';
import ICONS from './icon';

interface IconProps {
    type: string;
    options?: Record<string, any>;
    className?: string;
    style?: React.CSSProperties;
}

export default function Icon(props: IconProps) {
    let pathData = ICONS[props.type] || [];
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            style={props.style}
            className={`Icon ${props.className ? props.className : ''}`}
            width="24"
            height="24"
            viewBox="0 0 24 24"
        >
            {pathData.map((item: Record<string, any>, index: number) => {
                let data = Object.assign({}, item, props.options);
                return <path key={`${props.type}-${index}`} fill={data.fill} transform={data.transform} d={data.d} />;
            })}
        </svg>
    );
}

Icon.defaultProps = {
    className: '',
    type: '',
    options: {},
    style: {}
};
