/**
 * @file
 */
import * as React from 'react';
import './index.scss';

export interface ITocItem {
    title: string;
    line: number;
    level: number;
}

function TocList(props: any) {
    const [selectedId, setSelectedId] = React.useState<number>(-1);
    const onSelect = React.useCallback((item: ITocItem, index: number) => {
        setSelectedId(index);
        props.onSelect(item);
    }, [props.onSelect, setSelectedId]);
    return (
        <div className={`toc-wrapper ${props.className || ''}`}>
            {
                props.data.map((item: ITocItem, index: number) => (
                    <div
                        className="toc-item"
                        key={item.line}
                        onClick={() => {onSelect(item, index);}}
                        style={{paddingLeft: `${item.level * 15}px`}}
                    >
                        <a className={
                            selectedId === index
                                ? 'toc-link-selected toc-link'
                                : 'toc-link'}
                        >
                            {item.title}
                        </a>
                    </div>
                ))
            }
        </div>
    );
}

TocList.defaultProps = {
    data: []
};

export default React.memo(TocList);
