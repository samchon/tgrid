/**
 * @hidden
 */
export interface IHeaderWrapper<Headers> {
  header: Headers;
}

/**
 * @hidden
 */
export namespace IHeaderWrapper {
  export function wrap<Header>(header: Header): IHeaderWrapper<Header> {
    return {
      header: header,
    };
  }
}
