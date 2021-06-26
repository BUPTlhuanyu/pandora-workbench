import {
    Ctor,
    DependencyKey,
    DependencyMeta,
    Identifier,
    isIdentifier,
} from './typings';

export const dependencyIds = new Map<string, Identifier<any>>();
export const DEPENDENCIES = '$$TAOTIE_DEPENDENCIES';
export const TARGET = '$$TAOTIE_TARGET';

/**
 * 获取消费者依赖的服务
 * @param ctor 消费者
 */
export function getDependencies<T>(ctor: Ctor<T>): Array<DependencyMeta<T>> {
    return (ctor as any)[DEPENDENCIES] || [];
}

/**
 * 设置消费者的依赖
 * @param ctor 消费者
 * @param id 服务id
 * @param index 参数index
 * @param optional 是否可选
 */
export function setDependencies<T>(
    ctor: Ctor<any>,
    id: DependencyKey<T>,
    index: number,
    optional: boolean
) {
    const meta: DependencyMeta<T> = {id, index, optional};

    // cope with dependency that is inherited from another
    if ((ctor as any)[TARGET] === ctor) {
        ; (ctor as any)[DEPENDENCIES].push(meta);
    }
    else {
        ; (ctor as any)[DEPENDENCIES] = [meta]
        ; (ctor as any)[TARGET] = ctor;
    }
}

const RECURSION_MAX = 10;

let recursionCounter = 0;

export function requireInitialization(): void {
    recursionCounter += 1;
}

export function completeInitialization(): void {
    recursionCounter -= 1;
}

export function resetRecursionCounter() {
    recursionCounter = 0;
}

/**
 * 检测依赖循环引用了
 * @param key
 */
export function assertRecursionNotTrappedInACircle(
    key: DependencyKey<any>
): void {
    if (recursionCounter > RECURSION_MAX) {
        resetRecursionCounter();

        throw new Error(
            `[TAOTIE] "createInstance" exceeds the limitation of recursion (${RECURSION_MAX}x). `
            + 'There might be a circular dependency among your dependency items. '
            + `Last target was "${getDependencyKeyName(key)}".`
        );
    }
}

export function getDependencyKeyName(key: DependencyKey<any>): string {
    return isIdentifier(key) ? key.toString() : key.name;
}
