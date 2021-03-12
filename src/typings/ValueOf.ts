/** 
 * @packageDocumentation
 * @module tgrid.typings
 */
//----------------------------------------------------------------
export type ValueOf<Instance> = 
    is_value_of<Instance, Boolean> extends true ? boolean
    : is_value_of<Instance, Number> extends true ? number
    : is_value_of<Instance, String> extends true ? string
    : Instance;

type is_value_of<Instance, Object extends IValueOf<any>> = 
    Instance extends Object
        ? Object extends IValueOf<infer Primitive>
            ? Instance extends Primitive
                ? false
                : true // not Primitive, but Object
            : false // cannot be
        : false;

interface IValueOf<T>
{
    valueOf(): T;
}