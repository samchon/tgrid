/**
 * @internal
 */
export interface IHeaderWrapper<Headers> {
  header: Headers;
}

/**
 * @internal
 */
export namespace IHeaderWrapper {
  export function wrap<Header>(header: Header): IHeaderWrapper<Header> {
    return {
      header: header,
    };
  }
}
