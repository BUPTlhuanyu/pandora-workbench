export type Ctor<T = any> = new (...args: any[]) => T;

export const IdentifierSymbol = Symbol('$$WEDI_IDENTIFIER');

export interface Identifier<T = any> {
    type?: T;
    toString(): string;
    [IdentifierSymbol]: boolean;
    (target: Ctor<T>, key: string, index: number): void;
}

export function isIdentifier(thing: any): thing is Identifier {
    return thing[IdentifierSymbol];
}

export interface DependencyMeta<T> {
    id: DependencyKey<T>;
    index: number;
    optional: boolean;
}

export class InitPromise<T = any> {
    readonly ctor: any;
    readonly lazyInstantiation: boolean;
    readonly extraParams: any[];

    constructor(ctor: Ctor<T>, lazyInstantiation: boolean = false, extraParams: any[] = []) {
        this.ctor = ctor;
        this.lazyInstantiation = lazyInstantiation;
        this.extraParams = extraParams
    }
}

export function isInitPromise(thing: any): thing is InitPromise {
    return thing instanceof InitPromise;
}

export interface ClassItem<T> {
    useClass: Ctor<T>;
    lazyInstantiation?: boolean;
    extraParams?: any[];
}

export function isClassItem<T = any>(thing: any): thing is ClassItem<T> {
    return !!(thing as any).useClass;
}

export interface ValueItem<T> {
    useValue: T;
}

export function isValueItem<T = any>(thing: any): thing is ValueItem<T> {
    return !!(thing as any).useValue;
}

export interface FactoryItem<T> {
    useFactory(...args: any[]): T;
    deps?: Array<DependencyKey<any>>;
}

export function isFactoryItem<T = any>(thing: any): thing is FactoryItem<T> {
    return !!(thing as any).useFactory;
}

export type DependencyValue<T> =
    | Ctor<T>
    | InitPromise<T>
    | ValueItem<T>
    | ClassItem<T>
    | FactoryItem<T>;

export type DependencyKey<T> = Identifier<T> | Ctor<T>;

export type DependencyItem<T> = [Identifier<T>, DependencyValue<T>] | Ctor<T>;

export interface Disposable {
    dispose(): void;
}

export function isDisposable(thing: any): thing is Disposable {
    return !!(thing as any).dispose;
}
