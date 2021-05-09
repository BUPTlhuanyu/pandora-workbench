/**
 * @file
 */
import React from 'react';
import './index.scss';

interface FooterProps {
    count: number;
}

function Footer(props: FooterProps) {
    return (
        <div className="taotie-markdown-footer">
            {props.count} 词
        </div>
    );
}

Footer.defaultProps = {
    count: 0
};

export default React.memo(Footer);
