//================================================================ 
/** @module tgrid.components */
//================================================================
/**
 * Driver RFC (Remote Function Call).
 * 
 * The `Controller` is an interface who defines provided functions from the remote system. 
 * The `Driver` is an object who makes to call remote functions, defined in the 
 * `Controller` and provided by `Provider` in the remote system, possible.
 * 
 * In other words, calling a functions in the `Driver<Controller>`, it means to call a 
 * matched function in the remote system's `Provider` object.
 * 
 *   - `Controller`: Definition only
 *   - `Driver`: Remote Function Call
 * 
 * @typeParam Controller An interface defining features (functions & objects) provided from the remote system.
 * @author Jeongho Nam <http://samchon.org>
 */
export type Driver<Controller extends object> = Readonly<Promisify<Controller>>;
export var Driver = Proxy;

/**
 * Promisify an object type.
 * 
 * It promisifies all member types. When a member type is:
 * 
 *   - function: returns `Promise` (`R` -> `Promise<R>`).
 *   - object: promisifies recursively (`O` -> `Promisify<O>`).
 *   - atomic value: be ignored (be `never` type).
 * 
 * @typeParam Instance An object type to be promisied.
 * @author Jeongho Nam <http://samchon.org>
 */
export type Promisify<Instance extends object> = 
    // IS FUNCTION?
    Instance extends Function
        ? Instance extends (...args: infer Params) => infer Ret
            ? Ret extends Promise<any>
                ? Ret extends Promise<infer PromiseRet>
                    ? (...args: Params) => Promise<Primitify<PromiseRet>>
                    : (...args: Params) => Promise<any>
                : (...args: Params) => Promise<Primitify<Ret>>
            : (...args: any[]) => Promise<any>
    : 
    { // IS OBJECT?
        [P in keyof Instance]: Instance[P] extends object
            ? Promisify<Instance[P]>
            : never;
    };

/**
 * Primitify a type.
 * 
 * If target type is an object, all methods defined in the object would be removed.
 * 
 * @typeParam A type to be primitive
 * @author Jeongho Nam <http://samchon.org>
 */
export type Primitify<T> = T extends object
    ? {
        [P in keyof T]: T[P] extends Function
            ? never
            : Primitify<T[P]>
    } : T;