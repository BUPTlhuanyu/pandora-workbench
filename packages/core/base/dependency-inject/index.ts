/**
 * from https://github.com/wendellhu95/wedi
 * 依赖注入服务
 */
export {DependencyCollection} from './collection';
export {createDecorator, Need, Optional} from './decorators';
export {Injector} from './injector';
export {registerSingleton} from './singleton';
export {
    ClassItem,
    isClassItem,
    ValueItem,
    isValueItem,
    FactoryItem,
    isFactoryItem,
    DependencyValue,
    DependencyItem,
    Disposable,
    isDisposable,
} from './typings';
