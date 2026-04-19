/**
 * @file
 */
import React from 'react';
import './index.less';

interface FooterProps {
    count: number;
}

function Footer(props: FooterProps) {
    return (
        <div className="pandora-markdown-footer">
            {props.count} 词
        </div>
    );
}

Footer.defaultProps = {
    count: 0
};

export default React.memo(Footer);
