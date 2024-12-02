import { is_node, sleep_for } from "tstl";

import { Invoke } from "../../components/Invoke";
import { ConnectorBase } from "../internal/ConnectorBase";
import { IHeaderWrapper } from "../internal/IHeaderWrapper";
import { once } from "../internal/once";
import { WebSocketError } from "./WebSocketError";
import { IWebSocketCommunicator } from "./internal/IWebSocketCommunicator";
import { WebSocketPolyfill } from "./internal/WebSocketPolyfill";

/**
 * Web Socket Connector.
 *
 * The `WebSocketConnector` is a communicator class which connects to a
 * {@link WebSocketServer websocket server}, and interacts with it through RPC
 * (Remote Procedure Call) concept.
 *
 * You can connect to the websocket server using {@link connect} method. The
 * interaction would be started if the server accepts your connection by calling
 * the {@link WebSocketAcceptor.accept} method. If the remote server rejects your
 * connection through {@link WebSocketAcceptor.reject} method, the exception
 * would be thrown.
 *
 * After the connection, don't forget to {@link closing} the connection, if your
 * business logics have been completed, to clean up the resources. Otherwise, the
 * closing must be performed by the remote websocket server, you can wait the
 * remote server's closing signal through the {@link join} method.
 *
 * Also, when declaring this `WebSocketConnector` type, you've to define three
 * generic arguments; `Header`, `Provider` and `Remote`. Those generic arguments must
 * be same with the ones defined in the target {@link WebSocketServer} and
 * {@link WebSocketAcceptor} classes (`Provider` and `Remote` must be reversed).
 *
 * For reference, the first `Header` type represents an initial data from the
 * remote client after the connection. I recommend utilize it as an activation tool
 * for security enhancement. The second generic argument `Provider` represents a
 * provider from client to server, and the other `Remote` means a provider from the
 * remote server to client.
 *
 * @template Header Type of the header containing initial data.
 * @template Provider Type of features provided for the remote server.
 * @template Remote Type of features supported by remote server.
 * @author Jeongho Nam - https://github.com/samchon
 */
export class WebSocketConnector<
    Header,
    Provider extends object | null,
    Remote extends object | null,
  >
  extends ConnectorBase<Header, Provider, Remote>
  implements IWebSocketCommunicator
{
  /**
   * @hidden
   */
  private socket_?: WebSocket;

  /* ----------------------------------------------------------------
    CONNECTION
  ---------------------------------------------------------------- */
  /**
   * Connect to remote websocket server.
   *
   * Try connection to the remote websocket server with its address and waiting for the
   * server to accept the trial. If the server rejects your connection, then exception
   * would be thrown (in *Promise.catch*, as `WebSocketError`).
   *
   * After the connection and your business has been completed, don't forget to closing the
   * connection in time to prevent waste of the server resource.
   *
   * @param url URL address to connect.
   * @param options Detailed options like timeout.
   */
  public async connect(
    url: string,
    options: Partial<WebSocketConnector.IConnectOptions> = {},
  ): Promise<void> {
    // TEST CONDITION
    if (this.socket_ && this.state !== WebSocketConnector.State.CLOSED)
      if (this.socket_.readyState === WebSocketConnector.State.CONNECTING)
        throw new Error(
          "Error on WebSocketConnector.connect(): already connecting.",
        );
      else if (this.socket_.readyState === WebSocketConnector.State.OPEN)
        throw new Error(
          "Error on WebSocketConnector.connect(): already connected.",
        );
      else
        throw new Error(
          "Error on WebSocketConnector.connect(): already closing.",
        );

    //----
    // CONNECTION
    //----
    // PREPARE ASSETS
    this.state_ = WebSocketConnector.State.CONNECTING;

    try {
      // DO CONNECT
      const factory = is_node()
        ? ((await WebSocketPolyfill()) as any)
        : self.WebSocket;
      this.socket_ = new factory(url);
      await this._Wait_connection();

      // SEND HEADERS
      this.socket_!.send(JSON.stringify(IHeaderWrapper.wrap(this.header)));

      // PROMISED HANDSHAKE
      if (
        (await this._Handshake(options.timeout)) !==
        WebSocketConnector.State.OPEN.toString()
      )
        throw new WebSocketError(
          1008,
          "Error on WebSocketConnector.connect(): target server may not be opened by TGrid. It's not following the TGrid's own handshake rule.",
        );

      // SUCCESS
      this.state_ = WebSocketConnector.State.OPEN;
      {
        this.socket_!.onmessage = this._Handle_message.bind(this);
        this.socket_!.onclose = this._Handle_close.bind(this);
        this.socket_!.onerror = () => {};
      }
    } catch (exp) {
      this.state_ = WebSocketConnector.State.NONE;
      if (
        this.socket_ &&
        this.socket_.readyState === WebSocketConnector.State.OPEN
      ) {
        this.socket_.onclose = () => {};
        this.socket_.close();
      }
      throw exp;
    }
  }

  /**
   * @hidden
   */
  private _Wait_connection(): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      this.socket_!.onopen = () => resolve(this.socket_!);
      this.socket_!.onclose = once((evt) => {
        reject(new WebSocketError(evt.code, evt.reason));
      });
      this.socket_!.onerror = once((evt) => {
        reject(
          new WebSocketError(
            1006,
            `Error on WebSocketConnector.connect(): ${(evt as any as ErrorEvent)?.message ?? "connection refused."}`,
          ),
        );
      });
    });
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
    // PREPARE JOINER
    const ret: Promise<void> = this.join();

    // DO CLOSE
    this.state_ = WebSocketConnector.State.CLOSING;
    this.socket_!.close(code, reason);

    // LAZY RETURN
    await ret;
  }

  /**
   * @hidden
   */
  private _Handshake(timeout?: number): Promise<string> {
    return new Promise((resolve, reject) => {
      /* eslint-disable */
      let completed: boolean = false;

      /* eslint-disable */
      let expired: boolean = false;

      // TIMEOUT
      if (timeout !== undefined)
        sleep_for(timeout).then(() => {
          if (completed === false) {
            reject(
              new WebSocketError(
                1008,
                `Error on WebSocketConnector.connect(): target server is not sending handshake data over ${timeout} milliseconds.`,
              ),
            );
            expired = true;
          }
        });

      // EVENT LISTENERS
      this.socket_!.onmessage = once((evt) => {
        if (expired === false) {
          completed = true;
          resolve(evt.data);
        }
      });
      this.socket_!.onclose = once((evt) => {
        if (expired === false) {
          completed = true;
          reject(new WebSocketError(evt.code, evt.reason));
        }
      });
      this.socket_!.onerror = once(() => {
        if (expired === false) {
          completed = true;
          reject(
            new WebSocketError(
              1006,
              "Error on WebSocketConnector.connect(): connection refused.",
            ),
          );
        }
      });
    });
  }

  /* ----------------------------------------------------------------
    ACCESSORS
  ---------------------------------------------------------------- */
  /**
   * Connection URL.
   */
  public get url(): string | undefined {
    return this.socket_ ? this.socket_.url : undefined;
  }

  /**
   * Get state.
   *
   * Get current state of connection state with the websocket server.
   *
   * List of values are such like below:
   *
   *   - `NONE`: The {@link WebSocketConnector} instance is newly created, but did nothing yet.
   *   - `CONNECTING`: The {@link WebSocketConnector.connect} method is on running.
   *   - `OPEN`: The connection is online.
   *   - `CLOSING`: The {@link WebSocketConnector.close} method is on running.
   *   - `CLOSED`: The connection is offline.
   */
  public get state(): WebSocketConnector.State {
    return this.state_;
  }

  /* ----------------------------------------------------------------
    COMMUNICATOR
  ---------------------------------------------------------------- */
  /**
   * @hidden
   */
  protected async sendData(invoke: Invoke): Promise<void> {
    this.socket_!.send(JSON.stringify(invoke));
  }

  /**
   * @hidden
   */
  private _Handle_message(evt: MessageEvent): void {
    if (typeof evt.data === "string") {
      const invoke: Invoke = JSON.parse(evt.data);
      this.replyData(invoke);
    }
  }

  /**
   * @hidden
   */
  private async _Handle_close(event: CloseEvent): Promise<void> {
    const error: WebSocketError | undefined =
      !event.code || event.code !== 1000
        ? new WebSocketError(event.code, event.reason)
        : undefined;

    this.state_ = WebSocketConnector.State.CLOSED;
    await this.destructor(error);
  }
}

/**
 *
 */
export namespace WebSocketConnector {
  /**
   * Current state of the {@link WebSocketConnector}.
   */
  export import State = ConnectorBase.State;

  /**
   * Connection options for the {@link WebSocketConnector.connect}.
   */
  export interface IConnectOptions {
    /**
     * Milliseconds to wait the web-socket server to accept or reject it. If omitted, the waiting would be forever.
     */
    timeout: number;
  }
}
