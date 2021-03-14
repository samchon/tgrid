/** 
 * @packageDocumentation
 * @module tgrid.typings
 */
//----------------------------------------------------------------
import { Parametric } from "./Parametric";
import { Primitive } from "./Primitive";

/**
 * Promisify a function type.
 * 
 * Return type of the target function would be promisified and primitified.
 * 
 *   - `Ret`: `Promise<Primitive<Ret>>`
 *   - `Promise<Ret>`: `Promise<Primitive<Ret>>`
 * 
 * @template Method A function type to be promisified.
 * @template UseParametric Whether to convert type of function parameters to be compatible with their pritimive.
 * @author Jeongho Nam - https://github.com/samchon
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