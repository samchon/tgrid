/** 
 * @packageDocumentation
 * @module tgrid.typings
 */
//----------------------------------------------------------------
import { Functional } from "./Functional";
import { OmitEdgeUnderscored } from "./OmitEdgeUnderscored";
import { RemoveNever } from "./RemoveNever";
import { ValueOf } from "./ValueOf";

/**
 * Promisify an object type.
 * 
 * It promisifies all member types. When a member type is:
 * 
 *   - function: returns `Promise` (`R` -> `Promise<R>`).
 *   - object: promisifies recursively (`O` -> `Promisify<O>`).
 *   - atomic value: be ignored (be `never` type).
 * 
 * @template Instance An object type to be promised.
 * @template UseParametric Whether to convert type of function parameters to be compatible with their pritimive.
 */
 export type Promisive<Instance extends object, UseParametric extends boolean = false> = RemoveNever<OmitEdgeUnderscored<
 {
     [P in keyof Instance]: Instance[P] extends Function
         ? Functional<Instance[P], UseParametric> // function, its return type would be capsuled in the Promise
         : ValueOf<Instance[P]> extends object
             ? Instance[P] extends object
                ? Promisive<Instance[P], UseParametric> // object would be promisified
                : never // cannot be
             : never // atomic value
 } & IRemoteObject>>;

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