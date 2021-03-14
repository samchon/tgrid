/** 
 * @packageDocumentation
 * @module tgrid.typings
 */
//----------------------------------------------------------------
/**
 * JSON convertible.
 * 
 * @template T Target type to be converted
 * @author Jeongho Nam - https://github.com/samchon
 */
export interface IJsonable<T>
{
    toJSON(): T;
}