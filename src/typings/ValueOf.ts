// wrapper objects (`Boolean`, `Number`, `String`) are intended here: they are
// what `ValueOf` unwraps into their primitive counterparts
/* eslint-disable @typescript-eslint/ban-types */
/**
 * Get origin value type.
 *
 * @template Instance Target instance
 * @author Jeongho Nam - https://github.com/samchon
 */
export type ValueOf<Instance> =
  is_value_of<Instance, Boolean> extends true
    ? boolean
    : is_value_of<Instance, Number> extends true
      ? number
      : is_value_of<Instance, String> extends true
        ? string
        : Instance;
/* eslint-enable @typescript-eslint/ban-types */

type is_value_of<
  Instance,
  Wrapper extends IValueOf<any>,
> = Instance extends Wrapper
  ? Wrapper extends IValueOf<infer Primitive>
    ? Instance extends Primitive
      ? false
      : true // not Primitive, but Object
    : false // cannot be
  : false;

interface IValueOf<T> {
  valueOf(): T;
}
