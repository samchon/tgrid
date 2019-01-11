//================================================================ 
/** @module tgrid.basic */
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
 * @wiki https://github.com/samchon/tgrid/wiki/Workers
 * @author Jeongho Nam <http://samchon.org>
 */
export type Driver<Controller extends object> = Promisify<Controller>;
export var Driver = Proxy;

/**
 * Promisify an object type.
 * 
 * It promisifies all member types. When a member type is:
 *   - function: returns `Promise` (`R` -> `Promise<R>`).
 *   - object: promisifies recursively (`O` -> `Promisify<O>`).
 *   - atomic value: be ignored (be `never` type).
 * 
 * @typeParam Instance An object type to be promisied.
 * @wiki https://github.com/samchon/tgrid/wiki/Workers
 * @author Jeongho Nam <http://samchon.org>
 */
export type Promisify<Instance extends object> = 
    // IS FUNCTION?
    Instance extends Function
        ? Instance extends (...args: infer Params) => infer Ret
            ? Ret extends Promise<any>
                ? (...args: Params) => Ret
                : (...args: Params) => Promise<Ret>
            : (...args: any[]) => Promise<any>
    : 
    { // IS OBJECT?
        [P in keyof Instance]: Instance[P] extends object
            ? Promisify<Instance[P]>
            : never;
    };