/** 
 * @packageDocumentation
 * @module tgrid.typings
 */
//----------------------------------------------------------------
export interface IJsonable<T>
{
    toJSON(): T;
}