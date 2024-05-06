import type http from "http";
import { DomainError } from "tstl";
import type WebSocket from "ws";

import { Invoke } from "../../components/Invoke";
import { AcceptorBase } from "../internal/AcceptorBase";
import { IHeaderWrapper } from "../internal/IHeaderWrapper";
import { WebSocketError } from "./WebSocketError";
import { IWebSocketCommunicator } from "./internal/IWebSocketCommunicator";

/**
 * Web Socket Acceptor.
 *
 *  - available only in the NodeJS.
 *
 * The `WebSocketAcceptor` is a communicator class interacting with the remote (web socket) client using
 * [RFC](https://github.com/samchon/tgrid#13-remote-function-call) (Remote Function Call). The
 * `WebSocketAcceptor` objects are always created by the {@link WebSocketServer} class whenever a remote client
 * connects to its server.
 *
 * To accept connection and start interaction with the remote client, call the {@link accept}
 * method with special `Provider`. After the {@link accept acceptance}, don't forget to closing the
 * connection after your busines has been completed. Otherwise, you don't want to accept but reject
 * the connection, call the {@link reject} method.
 *
 * Also, when declaring this {@link WebSocketAcceptor} type, you've to define two template arguments,
 * *Header* and *Provider*. The *Header* type repersents an initial data gotten from the remote
 * client after the connection. I hope you and client not to omit it and utilize it as an
 * activation tool to enhance security.
 *
 * The second template argument *Provider* represents the features provided for the remote client.
 * If you don't have any plan to provide any feature to the remote client, just declare it as
 * `null`.
 *
 * @template Header Type of the header containing initial data.
 * @template Provider Type of features provided for the remote system.
 * @template Remote Type of features supported by remote system, used for {@link getDriver} function.
 * @author Jeongho Nam - https://github.com/samchon
 */
export class WebSocketAcceptor<
    Header,
    Provider extends object | null,
    Remote extends object | null,
  >
  extends AcceptorBase<Header, Provider, Remote>
  implements IWebSocketCommunicator
{
  /**
   * @hidden
   */
  private request_: http.IncomingMessage;

  /**
   * @hidden
   */
  private socket_: WebSocket;

  /* ----------------------------------------------------------------
    CONSTRUCTORS
  ---------------------------------------------------------------- */
  public static upgrade<
    Header,
    Provider extends object | null,
    Remote extends object | null,
  >(
    request: http.IncomingMessage,
    socket: WebSocket,
    handler?: (
      acceptor: WebSocketAcceptor<Header, Provider, Remote>,
    ) => Promise<any>,
  ): void {
    socket.once("message", async (data: WebSocket.Data) => {
      // @todo: custom code is required
      if (typeof data !== "string") socket.close();
      else
        try {
          const wrapper: IHeaderWrapper<Header> = JSON.parse(data as string);
          const acceptor: WebSocketAcceptor<Header, Provider, Remote> =
            new WebSocketAcceptor(request, socket, wrapper.header);
          if (handler !== undefined) await handler(acceptor);
        } catch (exp) {
          socket.close();
        }
    });
  }

  /**
   * @hidden
   */
  private constructor(
    request: http.IncomingMessage,
    socket: WebSocket,
    header: Header,
  ) {
    super(header);

    this.request_ = request;
    this.socket_ = socket;
  }

  /**
   * @inheritDoc
   */
  public async close(code?: number, reason?: string): Promise<void> {
    // TEST CONDITION
    const error: Error | null = this.inspectReady("close");
    if (error) throw error;

    //----
    // CLOSE WITH JOIN
    //----
    // PREPARE LAZY RETURN
    const ret: Promise<void> = this.join();

    // DO CLOSE
    this.state_ = WebSocketAcceptor.State.CLOSING;
    if (code === 1000) this.socket_!.close();
    else this.socket_!.close(code!, reason!);

    // state would be closed in destructor() via _Handle_close()
    await ret;
  }

  /**
   * @hidden
   */
  protected async destructor(error?: Error): Promise<void> {
    await super.destructor(error);
    this.state_ = WebSocketAcceptor.State.CLOSED;
  }

  /* ----------------------------------------------------------------
    ACCESSORS
  ---------------------------------------------------------------- */
  /**
   * IP Address of client.
   */
  public get ip(): string {
    return this.request_.connection.remoteAddress!;
  }

  /**
   * Path of client has connected.
   */
  public get path(): string {
    return this.request_.url!;
  }

  /**
   * Get state.
   *
   * Get current state of connection state with the remote client.
   *
   * List of values are such like below:
   *
   *   - `REJECTING`: The {@link WebSocketAcceptor.reject} method is on running.
   *   - `NONE`: The {@link WebSocketAcceptor} instance is newly created, but did nothing yet.
   *   - `ACCEPTING`: The {@link WebSocketAcceptor.accept} method is on running.
   *   - `OPEN`: The connection is online.
   *   - `CLOSING`: The {@link WebSocketAcceptor.close} method is on running.
   *   - `CLOSED`: The connection is offline.
   */
  public get state(): WebSocketAcceptor.State {
    return this.state_;
  }

  /* ----------------------------------------------------------------
    HANDSHAKES
  ---------------------------------------------------------------- */
  /**
   * @inheritDoc
   */
  public async accept(provider: Provider): Promise<void> {
    // VALIDATION
    if (this.state_ !== WebSocketAcceptor.State.NONE)
      throw new DomainError(
        "Error on WebSocketAcceptor.accept(): you've already accepted (or rejected) the connection.",
      );

    // PREPARE ASSETS
    this.state_ = WebSocketAcceptor.State.ACCEPTING;
    this.provider_ = provider;

    // REGISTER EVENTS
    this.socket_.on("message", this._Handle_message.bind(this));
    this.socket_.on("close", this._Handle_close.bind(this));
    this.socket_.send(WebSocketAcceptor.State.OPEN.toString());

    // FINISHED
    this.state_ = WebSocketAcceptor.State.OPEN;
  }

  /**
   * Reject connection.
   *
   * Reject without acceptance, any interaction. The connection would be closed immediately.
   *
   * @param status Status code.
   * @param reason Detailed reason to reject.
   */
  public async reject(status?: number, reason?: string): Promise<void> {
    // VALIDATION
    if (this.state_ !== WebSocketAcceptor.State.NONE)
      throw new DomainError(
        "You've already accepted (or rejected) the connection.",
      );

    // SEND CLOSING FRAME
    this.state_ = WebSocketAcceptor.State.REJECTING;
    this.socket_.close(status, reason);

    // FINALIZATION
    await this.destructor();
  }

  /* ----------------------------------------------------------------
    COMMUNICATOR
  ---------------------------------------------------------------- */
  /**
   * @hidden
   */
  protected async sendData(invoke: Invoke): Promise<void> {
    this.socket_.send(JSON.stringify(invoke));
  }

  /**
   * @hidden
   */
  private _Handle_message(data: WebSocket.Data): void {
    if (typeof data === "string") {
      const invoke: Invoke = JSON.parse(data);
      this.replyData(invoke);
    }
  }

  /**
   * @hidden
   */
  private async _Handle_close(code: number, reason: string): Promise<void> {
    const error: WebSocketError | undefined =
      code !== 100 ? new WebSocketError(code, reason) : undefined;

    await this.destructor(error);
  }
}

/**
 *
 */
export namespace WebSocketAcceptor {
  /**
   * Current state of the {@link WebSocketAcceptor}.
   */
  export import State = AcceptorBase.State;
}
