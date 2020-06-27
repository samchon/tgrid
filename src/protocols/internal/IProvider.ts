/** 
 * @packageDocumentation
 * @module tgrid.protocols
 */
//----------------------------------------------------------------
/**
 * @hidden
 */
export namespace IProvider
{
    export type Arguments<Provider> = Provider extends null
        ? [null?]
        : [Provider];

    export function fetch<Provider>(args: Arguments<Provider>): Provider
    {
        return args[0] === undefined ? null as any : args[0];
    }
}