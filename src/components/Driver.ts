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
export type Driver<Controller extends object> = Driver.Promisifier<Controller>;
export namespace Driver
{
    /* ----------------------------------------------------------------
        PROMISIFIERS
    ---------------------------------------------------------------- */
    /**
     * Promisify an object type.
     * 
     * It promisifies all member types. When a member type is:
     * 
     *   - function: returns `Promise` (`R` -> `Promise<R>`).
     *   - object: promisifies recursively (`O` -> `Promisify<O>`).
     *   - atomic value: be ignored (be `never` type).
     * 
     * @typeParam Instance An object type to be promised.
     */
    export type Promisifier<Instance extends object> = 
    {
        readonly [P in keyof Instance]: Instance[P] extends Function
            ? Functor<Instance[P]>
            : Instance[P] extends object
                ? Promisifier<Instance[P]>
                : never
    } & IRemoteObject;

    /**
     * Promisify a function type.
     * 
     * Return type of the target function would be promisified and primitified.
     * 
     *   - `T`: `Promise<Primitifier<T>>`
     *   - `Promise<T>`: `Promise<Primitifer<T>>`
     * 
     * @typeParam Method A function type to be promisified.
     */
    export type Functor<Method extends Function> = 
    (
        Method extends (...args: infer Params) => infer Ret
            ? Ret extends Promise<infer PromiseRet>
                ? (...args: Params) => Promise<Primitifier<PromiseRet>>
                : (...args: Params) => Promise<Primitifier<Ret>>
            : (...args: any[]) => Promise<any>
    ) & IRemoteFunction; // protector

    /* ----------------------------------------------------------------
        PRIMITIFIERS
    ---------------------------------------------------------------- */
    /**
     * Primitify a type.
     * 
     * If target type is an object, all methods defined in the object would be 
     * removed. Also, if the target type has a `toJSON()` method, its return type 
     * would be chosen.
     * 
     * @typeParam T A type to be primitive
     */
    export type Primitifier<Instance> = Instance extends object
        ? Instance extends IJsonable<infer Raw>
            ? Raw extends object
                ? _ObjectPrimitifier<Raw>
                : Raw
            : _ObjectPrimitifier<Instance>
        : Instance;

    /**
     * @hidden
     */
    type _ObjectPrimitifier<Instance extends object> =
    {
        [P in keyof Instance]: Instance[P] extends Function
            ? never
            : Primitifier<Instance[P]>
    };

    /**
     * @hidden
     */
    interface IJsonable<T>
    {
        toJSON(): T;
    }

    /* ----------------------------------------------------------------
        PROTECTORS
    ---------------------------------------------------------------- */
    /**
     * Restrictions for Remote Object
     */
    export interface IRemoteObject
    {
        /**
         * Remote Object does not allow access to the `constructor`.
         */
        constructor: never;

        /**
         * Remote Object does not allow access to the `prototype`.
         */
        prototype: never;
    }

    /**
     * Restrictions for Remote Function
     */
    export type IRemoteFunction = 
    {
        /**
         * Remote Function does not allow it.
         */
        [P in keyof Function | "Symbol"]: never;
    };
}