/**
 * @file
 */
import {useMethodsNative} from '@huse/methods';
const reducers = {
    toggleOrSet(prevState: boolean, arg: any) {
        return typeof arg === 'boolean' ? arg : !prevState;
    }
};

export function useToggleOrSet(initialValue: boolean = false) {
    const [value, {toggleOrSet}] = useMethodsNative(reducers, initialValue);
    return [value, toggleOrSet] as const;
}
