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
   * It destories all RFCs (remote function calls) between this and remote websocket system
   * (through `Driver<Controller>`) that are not returned (completed) yet. The destruction
   * causes all incompleted RFCs to throw exceptions.
   *
   * If parametric *code* and *reason* are specified, it means the disconnection is
   * abnormal and it would throw special exceptions (`WebSocketError`) to the incompleted RFCs.
   *
   * @param code Closing code.
   * @param reason Reason why.
   */
  close(code?: number, reason?: string): Promise<void>;
}
