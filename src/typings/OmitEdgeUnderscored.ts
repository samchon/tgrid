/** 
 * @packageDocumentation
 * @module tgrid.typings
 */
//----------------------------------------------------------------
/**
 * Omit edge underscored member.
 * 
 * @template T Target instance type.
 * @author Jeongho Nam - https://github.com/samchon
 */
export type OmitEdgeUnderscored<T extends object> = {
    [P in keyof T]: P extends `_${string}`
        ? never
        : P extends `${string}_`
            ? never
            : T[P]
};