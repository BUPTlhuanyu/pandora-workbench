/**
 * @file
 */
import * as React from 'react';
import './index.scss';
import Icon from 'views/src/components/icon';

export interface ISearchResult {
    filename: string;
    list: string[];
    times: number;
}

function SearchListItem(props: any) {
    const [contentStatus, setContentStatus] = React.useState<boolean>(true);
    const onToggle = React.useCallback(e => {
        e.stopPropagation();
        setContentStatus(!contentStatus);
    }, [contentStatus]);
    const onSelect = React.useCallback(() => {
        props.onSelect(props.data.filename);
    }, [props.onSelect, props.data]);
    const onLineSelect = React.useCallback((line: number, htmlContent: string, filename: string) => {
        props.onLineSelect(line, htmlContent, filename);
    }, [props.onLineSelect]);
    return (
        <div className='search-item' onClick={onSelect}>
            <div className='search-header'>
                <span onClick={onToggle} className='search-prefix'>
                    <Icon
                        type='down'
                        style={{
                            fontSize: '14px',
                            transform: contentStatus ? 'rotate(0)' : 'rotate(-90deg)'
                        }}
                    />
                </span>
                <span className='search-title'>{props.data.filename}</span>
                <span className='search-count'>{props.data.times}</span>
            </div>
            <div style={{display: contentStatus ? 'flex' : 'none'}} className='search-content'>
                {
                    props.data.list.map(({line, text: htmlContent}: Record<string, any>, index: number) => (
                        <div
                            className='search-content-item'
                            onClick={e => {
                                e.stopPropagation();
                                onLineSelect(line, htmlContent, props.data.filename);
                            }}
                            dangerouslySetInnerHTML={{__html: htmlContent}}
                            key={`search-${index}`}
                        ></div>
                    ))
                }
            </div>
        </div>
    );
}

// TODO: 避免 XSS，使用dompurify处理item中的内容
function SearchList(props: any) {
    return (
        <div className={`search-wrapper ${props.className}`}>
            {
                props.data.map((item: ISearchResult) => (
                    <SearchListItem
                        onSelect={props.onSelect}
                        onLineSelect={props.onLineSelect}
                        key={item.filename}
                        data={item}
                    />
                ))
            }
        </div>
    );
}

SearchList.defaultProps = {
    data: []
};

export default React.memo(SearchList);
