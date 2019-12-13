import { ValueOf } from "../utils/ValueOf";

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
 * @typeParam UseParametric Whether to convert type of function parameters to be compatible with their pritimive.
 * @author Jeongho Nam <http://samchon.org>
 */
export type Driver<Controller extends object, Parametric extends boolean = false> = typeof Driver & Driver.Promisive<Controller, Parametric>;
export const Driver = class {};

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
     * @typeParam UseParametric Whether to convert type of function parameters to be compatible with their pritimive.
     */
    export type Promisive<Instance extends object, UseParametric extends boolean = false> = Readonly<
    {
        [P in keyof Instance]: Instance[P] extends Function
            ? Functional<Instance[P], UseParametric> // function, its return type would be capsuled in the Promise
            : ValueOf<Instance[P]> extends object
                ? Instance[P] extends object
                   ? Promisive<Instance[P], UseParametric> // object would be promisified
                   : never // cannot be
                : never // atomic value
    } & IRemoteObject>;

    /**
     * Promisify a function type.
     * 
     * Return type of the target function would be promisified and primitified.
     * 
     *   - `Ret`: `Promise<Primitive<Ret>>`
     *   - `Promise<Ret>`: `Promise<Primitive<Ret>>`
     * 
     * @typeParam Method A function type to be promisified.
     * @typeParam UseParametric Whether to convert type of function parameters to be compatible with their pritimive.
     */
    export type Functional<Method extends Function, UseParametric extends boolean = false> = 
    (
        Method extends (...args: infer Params) => infer Ret
            ? Ret extends Promise<infer PromiseRet>
                ? (...args: FunctionalParams<Params, UseParametric>) => Promise<Primitive<PromiseRet>>
                : (...args: FunctionalParams<Params, UseParametric>) => Promise<Primitive<Ret>>
            : (...args: any[]) => Promise<any>
    ) & IRemoteFunction;

    /**
     * @hidden
     */
    type FunctionalParams<Params extends any[], UseParametric extends boolean> = 
        UseParametric extends true ? Parametric<Params> : Params;

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
     * @typeParam Instance An instance type to be primitive
     */
    export type Primitive<Instance> = ValueOf<Instance> extends object
        ? Instance extends object
            ? Instance extends IJsonable<infer Raw>
                ? ValueOf<Raw> extends object
                    ? Raw extends object
                        ? PrimitiveObject<Raw> // object would be primitified
                        : never // cannot be
                    : ValueOf<Raw> // atomic value
                : PrimitiveObject<Instance> // object would be primitified
            : never // cannot be
        : ValueOf<Instance>;

    /**
     * @hidden
     */
    type PrimitiveObject<Instance extends object> =
    {
        [P in keyof Instance]: Instance[P] extends Function
            ? never
            : Primitive<Instance[P]>
    };

    /**
     * Convert parameters to be compatible with primitive.
     * 
     * @type Arguments List of parameters
     * @todo Considering whether this type is an over-spec or not.
     */
    export type Parametric<Arguments extends any[]> = 
    { 
        [P in keyof Arguments]: ParametricValue<Arguments[P]>; 
    };

    /**
     * @hidden
     */
    type ParametricValue<Instance> = ValueOf<Instance> | Primitive<Instance> | IJsonable<Primitive<Instance>>;

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

    /**
     * @hidden
     */
    interface IJsonable<T>
    {
        toJSON(): T;
    }
}