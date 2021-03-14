/** 
 * @packageDocumentation
 * @module tgrid.typings
 */
//----------------------------------------------------------------
import { IJsonable } from "./IJsonable";
import { Primitive } from "./Primitive";
import { ValueOf } from "./ValueOf";

/**
 * Convert parameters to be compatible with primitive.
 * 
 * @template Arguments List of parameters
 * @author Jeongho Nam - https://github.com/samchon
 */
 export type Parametric<Arguments extends any[]> = 
 { 
     [P in keyof Arguments]: ParametricValue<Arguments[P]>; 
 };

 /**
  * @hidden
  */
 type ParametricValue<Instance> = ValueOf<Instance> | Primitive<Instance> | IJsonable<Primitive<Instance>>;