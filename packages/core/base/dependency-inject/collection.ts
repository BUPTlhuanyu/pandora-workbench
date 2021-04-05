/**
 * 用于收集所有的依赖
 */
import {
    DependencyItem,
    DependencyKey,
    DependencyValue,
    Disposable,
    InitPromise,
    isDisposable,
    Ctor,
} from './typings';

export class DependencyCollection implements Disposable {
    /**
     * 是否已销毁
     */
    disposed: boolean = false;

    /**
     * 服务集合
     */
    private readonly items = new Map<
        DependencyKey<any>,
        DependencyValue<any> | any
    >();

    constructor(deps: Array<DependencyItem<any>> = []) {
        for (const dep of deps) {
            if (dep instanceof Array) {
                const [depKey, depItem] = dep;
                this.add(depKey, depItem);
            }
            else {
                this.add(dep);
            }
        }
    }
    /**
     * 添加服务
     * @param ctor 构造函数
     */
    add<T>(ctor: Ctor<T>): void
    // eslint-disable-next-line no-dupe-class-members
    add<T>(key: DependencyKey<T>, item: DependencyValue<T> | T): void
    // eslint-disable-next-line no-dupe-class-members
    add<T>(ctorOrKey: DependencyKey<T>, item?: DependencyValue<T> | T): void {
        this.ensureCollectionNotDisposed();

        if (item) {
            this.items.set(ctorOrKey, item);
        }
        else {
            this.items.set(ctorOrKey, new InitPromise(ctorOrKey as Ctor<T>));
        }
    }

    /**
     * 是否存在服务
     * @param key 
     */
    has(key: DependencyKey<any>): boolean {
        this.ensureCollectionNotDisposed();

        return this.items.has(key);
    }

    /**
     * 获取服务
     * @param key 
     */
    get<T>(key: DependencyKey<T>): T | DependencyValue<T> | undefined {
        this.ensureCollectionNotDisposed();

        return this.items.get(key);
    }

    /**
     * 销毁所有服务
     */
    dispose(): void {
        this.disposed = true;

        this.items.forEach((item) => {
            if (isDisposable(item)) {
                item.dispose();
            }
        });
    }

    /**
     * 确保服务没有被销毁
     */
    private ensureCollectionNotDisposed(): void {
        if (this.disposed) {
            throw new Error(
                '[taotie] Dependency collection is not accessible after it disposes!'
            );
        }
    }
}
