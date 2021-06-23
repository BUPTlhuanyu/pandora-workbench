/**
 * @file
 */
import * as React from 'react';
import './index.scss';

export interface ISearchResult {
    filename: string;
    list: string[];
    times: number;
}

// TODO: 避免 XSS，使用dompurify处理item中的内容
function SearchList(props: any) {
    return (
        <div>
            {
                props.data.map((item: ISearchResult) => (<div key={item.filename}>
                    <div className="search-header">
                        <span className="search-title">{item.filename}</span>
                        <span className="search-count">{item.times}</span>
                    </div>
                    {
                        item.list.map((htmlContent: string, index: number) => (
                            <div
                                className="search-content"
                                dangerouslySetInnerHTML={{__html: htmlContent}}
                                key={`search-${index}`}
                            ></div>
                        ))
                    }
                </div>))
            }
        </div>
    );
}

SearchList.defaultProps = {
    data: []
};

export default React.memo(SearchList);
