/** 
 * @packageDocumentation
 * @module tgrid.protocols
 */
//----------------------------------------------------------------
/**
 * @hidden
 */
export interface IHeadersWrapper<Headers>
{
    headers: Headers;
}

/**
 * @hidden
 */
export namespace IHeadersWrapper
{
    export function wrap<Headers>(headers: Headers): IHeadersWrapper<Headers>
    {
        return {
            headers: headers
        };
    }
}