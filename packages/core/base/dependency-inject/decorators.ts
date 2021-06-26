import {Ctor, DependencyKey, Identifier, IdentifierSymbol} from './typings';
import {dependencyIds, setDependencies} from './utils';

/**
 * 创建装饰器
 * @param name 装饰器名称
 */
export function createDecorator<T>(name: string): Identifier<T> {
    if (dependencyIds.has(name)) {
        console.warn(`[pandora] duplicated identifier name ${name}.`);

        return dependencyIds.get(name)!;
    }

    const id = function (target: Ctor<T>, _key: string, index: number): void {
        setDependencies(target, id, index, false);
    } as Identifier<T>;

    id.toString = () => name;
    id[IdentifierSymbol] = true;

    dependencyIds.set(name, id);

    return id;
}

/**
 * wrap a Identifier with this function to make it optional
 * 申明可选依赖
 */
export function Optional<T>(key: DependencyKey<T>) {
    return function (target: Ctor<T>, _key: string, index: number) {
        setDependencies(target, key, index, true);
    };
}

/**
 * used inside constructor for services to claim dependencies
 * 申明必须依赖
 */
export function Need<T>(key: DependencyKey<T>) {
    return function<C> (target: Ctor<C>, _key: string, index: number) {
        setDependencies(target, key, index, false);
    };
}
