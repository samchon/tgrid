/* eslint-disable */
/**
 * @packageDocumentation
 * @module tgrid.typings
 */
//----------------------------------------------------------------
/**
 * Primitify a type.
 *
 * If target type is an object, all methods defined in the object would be
 * removed. Also, if the target type has a `toJSON()` method, its return type
 * would be chosen.
 *
 * @template Instance An instance type to be primitive
 * @author Jeongho Nam - https://github.com/samchon
 */
export type Primitive<Instance> = value_of<Instance> extends object
    ? Instance extends object
        ? Instance extends IJsonable<infer Raw>
            ? value_of<Raw> extends object
                ? Raw extends object
                    ? PrimitiveObject<Raw> // object would be primitified
                    : never // cannot be
                : value_of<Raw> // atomic value
            : PrimitiveObject<Instance> // object would be primitified
        : never // cannot be
    : value_of<Instance>;

type PrimitiveObject<Instance extends object> = Instance extends Array<infer T>
    ? Primitive<T>[]
    : {
          [P in keyof Instance]: Instance[P] extends Function
              ? never
              : Primitive<Instance[P]>;
      };

type value_of<Instance> = is_value_of<Instance, Boolean> extends true
    ? boolean
    : is_value_of<Instance, Number> extends true
    ? number
    : is_value_of<Instance, String> extends true
    ? string
    : Instance;

type is_value_of<
    Instance,
    Object extends IValueOf<any>,
> = Instance extends Object
    ? Object extends IValueOf<infer Primitive>
        ? Instance extends Primitive
            ? false
            : true // not Primitive, but Object
        : false // cannot be
    : false;

interface IValueOf<T> {
    valueOf(): T;
}

interface IJsonable<T> {
    toJSON(): T;
}
