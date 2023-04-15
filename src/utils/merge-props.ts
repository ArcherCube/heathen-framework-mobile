import assign from 'lodash/assign';
import assignWith from 'lodash/assignWith';
import isUndefined from 'lodash/isUndefined';

export function mergeProps<A, B>(a: A, b: B): B & A;
export function mergeProps<A, B, C>(a: A, b: B, c: C): C & B & A;
export function mergeProps<A, B, C, D>(a: A, b: B, c: C, d: D): C & B & A & D;
export function mergeProps(...items: any[]) {
    function customizer(objValue: any, srcValue: any) {
        return isUndefined(srcValue) ? objValue : srcValue;
    }

    let result = assign({}, items[0]);
    for (let A = 1; A < items.length; A++) {
        result = assignWith(result, items[A], customizer);
    }
    return result;
}

/**
 * 根据参数列表决定需要使用的参数（非undefined的才会被使用），优先级从高到低
 * @param items 参数列表
 * @returns 
 */
export function propsList<T>(...items: T[]): T | undefined {
    for (let A = 0; A < items.length; ++A) {
        if (items[A] !== undefined) {
            return items[A];
        }
    }
    return undefined;
}