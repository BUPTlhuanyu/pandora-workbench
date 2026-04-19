/**
 * @file
 */
import {ref} from 'vue';

export function useToggleOrSet(initialValue: boolean = false) {
    const value = ref(initialValue);

    function toggleOrSet(arg?: boolean) {
        value.value = typeof arg === 'boolean' ? arg : !value.value;
    }

    return [value, toggleOrSet] as const;
}
