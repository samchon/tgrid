import { IJsonable } from "./IJsonable";
import { Primitive } from "./Primitive";
import { ValueOf } from "./ValueOf";

export type Parametric<Arguments extends any[]> = {
  [P in keyof Arguments]: ParametricValue<Arguments[P]>;
};

/**
 * @hidden
 */
type ParametricValue<Instance> =
  | ValueOf<Instance>
  | Primitive<Instance>
  | IJsonable<Primitive<Instance>>;
