import * as React from 'react';
import './index.scss';
import getClassname from 'views/src/utils/classMaker';
import FileFolder from 'views/src/components/file-folder';

interface ISiderProps {
    className: string;
}

export default React.forwardRef(function Sider(props: ISiderProps, ref: any) {
    const [className] = React.useState(() => {
        return getClassname({
            'taotie-sider-wrapper': true,
            [props.className]: true
        });
    });
    return (
        <div className={className} ref={ref}>
            <div className="taotie-sider-container">
                <div className="sider-title">
                    <div></div>
                    <div>文件</div>
                    <div></div>
                </div>
                <FileFolder className="sider-file-folder" />
            </div>
        </div>
    );
});
