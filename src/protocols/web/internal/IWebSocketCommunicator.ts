/**
 * Common interface for websocket communicators
 *
 * @author Jeongho Nam - https://github.com/samchon
 */
export interface IWebSocketCommunicator {
  /**
   * Close connection.
   *
   * Close connection with the remote websocket system.
   *
   * It destroys all RFCs (remote function calls) between this and remote websocket system
   * (through `Driver<Controller>`) that are not returned (completed) yet. The destruction
   * causes all incomplete RFCs to throw exceptions.
   *
   * If *code* is omitted, the normal closure code (`1000`) is used. A close code other than
   * `1000` means the disconnection is abnormal and causes special exceptions (`WebSocketError`)
   * to be thrown to incomplete RFCs.
   *
   * @param code Closing code.
   * @param reason Reason why.
   */
  close(code?: number, reason?: string): Promise<void>;
}
