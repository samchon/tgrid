/**
 * Web Socket Error.
 *
 * @reference https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
 * @author Jeongho Nam - https://github.com/samchon
 */
export class WebSocketError extends Error {
  public readonly status: number;

  /**
   * Initializer Constructor.
   *
   * @param status Status code.
   * @param message Detailed message, the reaason why.
   */
  public constructor(status: number, message: string) {
    super(message);

    // INHERITANCE POLYFILL
    const proto = new.target.prototype;
    if (Object.setPrototypeOf) Object.setPrototypeOf(this, proto);
    else (this as any).__proto__ = proto;

    this.status = status;
  }
}
