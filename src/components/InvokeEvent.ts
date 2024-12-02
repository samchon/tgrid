import { Invoke } from "./Invoke";

/**
 * Event of the RPC invocation.
 *
 * `InvokeEvent` is a type for the RPC invocation event. It's a type for
 * the event object that is dispatched when an RPC invocation is sended,
 * received, completed or returned.
 *
 * For reference, "send" and "commplete" events are dispatched from the
 * function calling request side, and "receive" and "return" events are
 * dispatched from the function calling executor side.
 *
 * @author Jeongho Nam - https://github.com/samchon
 */
export type InvokeEvent =
  | InvokeEvent.ISend
  | InvokeEvent.IReceive
  | InvokeEvent.IComplete
  | InvokeEvent.IReturn;
export namespace InvokeEvent {
  /**
   * Type of the invoke event.
   */
  export type Type = "send" | "receive" | "complete" | "return";

  /**
   * Event mapper for the RPC invocation.
   */
  export interface EventMapper {
    send: ISend;
    receive: IReceive;
    complete: IComplete;
    return: IReturn;
  }

  /**
   * RPC message send event.
   *
   * Dispatched when request function calling to the remote system.
   */
  export interface ISend {
    /**
     * Discriminator for the type of the event.
     */
    readonly type: "send";

    /**
     * Time when the event is occurred.
     */
    readonly time: Date;

    /**
     * Sending message to be invoked.
     */
    readonly function: Invoke.IFunction;
  }

  /**
   * RPC message receive event.
   *
   * Dispatched when requsted function calling from the remote system.
   */
  export interface IReceive {
    /**
     * Discriminator for the type of the event.
     */
    readonly type: "receive";

    /**
     * Time when the event is occurred.
     */
    readonly time: Date;

    /**
     * Received message to be invoked.
     */
    readonly function: Invoke.IFunction;
  }

  /**
   * RPC message complete event.
   *
   * Dispatched when request function calling is completed by the remote system.
   */
  export interface IComplete {
    /**
     * Discriminator for the type of the event.
     */
    readonly type: "complete";

    /**
     * Function calling request.
     */
    readonly function: Invoke.IFunction;

    /**
     * Returned value from the remote function calling.
     */
    readonly return: Invoke.IReturn;

    /**
     * Time when the function calling is requested.
     */
    readonly requested_at: Date;

    /**
     * Time when the function calling is completed.
     */
    readonly completed_at: Date;
  }

  /**
   * RPC message return event.
   *
   * Dispatched when return a result of the function calling from the remote system.
   */
  export interface IReturn {
    /**
     * Discriminator for the type of the event.
     */
    readonly type: "return";

    /**
     * Function calling requested by the remote system.
     */
    readonly function: Invoke.IFunction;

    /**
     * Return value that would be sent to the remove system.
     */
    readonly return: Invoke.IReturn;

    /**
     * Time when the function calling is requested by the remote system.
     */
    readonly requested_at: Date;

    /**
     * Time when the function calling is completed.
     */
    readonly completed_at: Date;
  }
}
