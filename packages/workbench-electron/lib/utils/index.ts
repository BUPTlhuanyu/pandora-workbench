export function camelToKebab(input: string) {
    return input.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

export function camelToWords(input: string) {
    return input.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
}
