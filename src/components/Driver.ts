//================================================================ 
/** @module tgrid.components */
//================================================================
import { IJsonable } from "../utils/IJsonable";

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
export type Driver<Controller extends object> = Driver.Promisive<Controller>;
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
    export type Promisive<Instance> = 
    {
        readonly [P in keyof Instance]: Instance[P] extends Function
            ? Functional<Instance[P]>
            : value_of<Instance[P]> extends object
                ? Promisive<Instance[P]>
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
    export type Functional<Method extends Function> = 
    (
        Method extends (...args: infer Params) => infer Ret
            ? Ret extends Promise<infer PromiseRet>
                ? (...args: Parametric<Params>) => Promise<Primitive<PromiseRet>>
                : (...args: Parametric<Params>) => Promise<Primitive<Ret>>
            : (...args: any[]) => Promise<any>
    ) & IRemoteFunction;

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
    export type Primitive<Instance> = value_of<Instance> extends object
        ? Instance extends IJsonable<infer Raw>
            ? value_of<Raw> extends object
                ? PrimitiveObject<Raw>
                : value_of<Raw>
            : PrimitiveObject<Instance>
        : value_of<Instance>;

    /**
     * @hidden
     */
    type PrimitiveObject<Instance> =
    {
        [P in keyof Instance]: Instance[P] extends Function
            ? never
            : Primitive<Instance[P]>
    };

    /**
     * Convert parameters to be compatible with primitive.
     * 
     * @type Arguments List of parameters
     */
    type Parametric<Arguments extends any[]> = 
    {
        [P in keyof Arguments]: value_of<Arguments[P]> extends object
            ? ParametricObject<Arguments[P]>
            : Primitive<Arguments[P]>
    };

    /**
     * @hidden
     */
    type ParametricObject<Instance> = value_of<Instance> | Primitive<Instance> | IJsonable<Primitive<Instance>>;

    /**
     * @hidden
     */
    type value_of<Instance> = 
        Instance extends Boolean ? boolean
        : Instance extends Number ? number
        : Instance extends String ? string
        : Instance extends BigInt ? bigint
        : Instance;

    /* ----------------------------------------------------------------
        PROTECTORS
    ---------------------------------------------------------------- */
    /**
     * Restrictions for Remote Object
     */
    interface IRemoteObject
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
    type IRemoteFunction = 
    {
        /**
         * Remote Function does not allow it.
         */
        [P in keyof Function | "Symbol"]: never;
    };
}