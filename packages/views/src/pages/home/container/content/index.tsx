/**
 * @file
 */
import './index.scss';
import * as React from 'react';
import {pandora} from 'views/src/services/pandora';

const prefix = 'pandora-home-content';

function Content() {
    const edEditor = React.useCallback(() => {
        pandora.ipcRenderer.invoke('pandora:mdEditor').then((resStr: string) => {
            console.log(resStr);
        }).catch(err => {
            console.warn(err);
        });
    }, []);
    return (
        <div className={`${prefix}`}>
            <span>Most popular</span>
            <div className={`${prefix}-banner`}>
                <div className={`${prefix}-banner-img`}></div>
                <div className={`${prefix}-banner-info`}>
                    <div className={`${prefix}-banner-info-title`}>
                        将进酒
                    </div>
                    <div className={`${prefix}-banner-info-desc`}>
                        君不见黄河之水天上来②，奔流到海不复回。
                        君不见高堂明镜悲白发③，朝如青丝暮成雪④。
                        人生得意须尽欢⑤，莫使金樽空对月⑥。
                        天生我材必有用⑦，千金散尽还复来⑧。
                        烹羊宰牛且为乐，会须一饮三百杯⑨。
                        岑夫子⑩，丹丘生⑪，将进酒，杯莫停⑫。
                        与君歌一曲⑬，请君为我倾耳听⑭。
                        钟鼓馔玉不足贵⑮，但愿长醉不复醒⑯。
                        古来圣贤皆寂寞⑰，惟有饮者留其名。
                        陈王昔时宴平乐⑱，斗酒十千恣欢谑⑲。
                        主人何为言少钱⑳，径须沽取对君酌㉑。
                        五花马㉒、千金裘㉓，呼儿将出换美酒㉔，与尔同销万古愁
                    </div>
                    <div className={`${prefix}-banner-info-time`}>
                        唐代李白诗作
                    </div>
                </div>
            </div>
            <span>Toolkits</span>
            <div className={`${prefix}-box`}>
                <div className={`${prefix}-box-item`} onClick={edEditor}>
                    <div className={`${prefix}-box-item-img`}></div>
                    <div className={`${prefix}-box-item-info`}>
                        Make wechart article easy!
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Content;