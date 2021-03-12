import { IJsonable } from "./IJsonable";
import { Primitive } from "./Primitive";
import { ValueOf } from "./ValueOf";

/**
 * Convert parameters to be compatible with primitive.
 * 
 * @template Arguments List of parameters
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