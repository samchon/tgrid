import { DomainError } from "tstl";

/**
 * Web Socket Error.
 *
 * @reference https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
 * @author Jeongho Nam - https://github.com/samchon
 */
export class WebError extends DomainError {
  public readonly status: number;

  /**
   * Initializer Constructor.
   *
   * @param status Status code.
   * @param message Detailed message, the reaason why.
   */
  public constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
