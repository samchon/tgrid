/**
 * Message structure for RFC (Remote Function Call).
 *
 * @author Jeongho Nam - https://github.com/samchon
 */
export type Invoke = Invoke.IFunction | Invoke.IReturn;

export namespace Invoke {
  /**
   * Message for Requesting RFC.
   */
  export interface IFunction extends IBase {
    /**
     * Target function (sometimes calsuled in objects) to call.
     */
    listener: string;

    /**
     * Parameters for the function call.
     */
    parameters: IParameter[];
  }

  export interface IParameter {
    type: string;
    value: any;
  }

  /**
   * Message for Returning RFC.
   */
  export interface IReturn extends IBase {
    /**
     * `true` -> return, `false` -> exception.
     */
    success: boolean;

    /**
     * Returned value or thrown exception.
     */
    value: any;
  }

  /**
   * @hiden
   */
  interface IBase {
    /**
     * Unique identifier.
     */
    uid: number;
  }
}
