import type http from "http";
import type https from "https";
import type net from "net";
import { is_node } from "tstl";
import type WebSocket from "ws";

import { NodeModule } from "../../utils/internal/NodeModule";
import { IServer } from "../internal/IServer";
import { WebSocketAcceptor } from "./WebSocketAcceptor";

/**
 * Web Socket Server.
 *
 *  - available only in the NodeJS.
 *
 * The `WebSocketServer` is a class who can open an websocket server. Clients
 * connecting to the `WebSocketServer` would communicate with this websocket server
 * through {@link WebSocketAcceptor} instances with RPC (Remote Procedure Call)
 * concept.
 *
 * To open the websocket server, call the {@link open} method with your callback
 * function which would be called whenever a {@link WebSocketAcceptor} has been
 * newly created by a new client's connection.
 *
 * Also, when declaring this {@link WebSocketServer} type, you have to define three
 * generic arguments; `Header`, `Provider` and `Remote`. Those generic arguments
 * would be propagated to the {@link WebSocketAcceptor}, so that
 * {@link WebSocketAcceptor} would have the same generic arguments, too.
 *
 * For reference, the first `Header` type represents an initial data from the
 * remote client after the connection. I recommend utilize it as an activation tool
 * for security enhancement. The second generic argument `Provider` represents a
 * provider from server to client, and the other `Remote` means a provider from the
 * remote client to server.
 *
 * @template Header Type of header containing initialization data like activation.
 * @template Provider Type of features provided for the remote client.
 * @template Remote Type of features provided by remote client.
 * @author Jeongho Nam - https://github.com/samchon
 */
export class WebSocketServer<
  Header,
  Provider extends object | null,
  Remote extends object | null,
> implements IServer<WebSocketServer.State>
{
  /**
   * @hidden
   */
  private state_: WebSocketServer.State;

  /**
   * @hidden
   */
  private options_: https.ServerOptions | null;

  /**
   * @hidden
   */
  private server_: http.Server | https.Server | null;

  /**
   * @hidden
   */
  private protocol_: WebSocket.Server | null;

  /* ----------------------------------------------------------------
    CONSTRUCTORS
  ---------------------------------------------------------------- */
  /**
   * Default Constructor for the `ws` server..
   *
   * Create an websocket server (`ws://`).
   */
  public constructor();

  /**
   * Initializer Constructor for the `wss` server.
   *
   * Create a secured websocket server (`wss://`).
   *
   * @param key Key string.
   * @param cert Certification string.
   */
  public constructor(key: string, cert: string);

  public constructor(key?: string, cert?: string) {
    if (is_node() === false)
      throw new Error(
        "Error on WebSocketServer.constructor(): only available in NodeJS.",
      );

    // PREPARE SERVER INSTANCE
    this.options_ = !!key && !!cert ? { key, cert } : null;

    // INITIALIZE STATUS & PROTOCOL
    this.state_ = WebSocketServer.State.NONE;
    this.server_ = null;
    this.protocol_ = null;
  }

  /**
   * Open websocket server.
   *
   * Open a server through the web-socket protocol, with its *port* number and *handler*
   * function determining whether to accept the client's connection or not. After the server has
   * been opened, clients can connect to that websocket server by using the {@link WebSocketConnector}
   * class.
   *
   * When implementing the *handler* function with the {@link WebSocketAcceptor} instance, calls the
   * {@link WebSocketAcceptor.accept} method if you want to accept the new client's connection.
   * Otherwise you don't want to accept the client and reject its connection, just calls the
   * {@link WebSocketAcceptor.reject} instead.
   *
   * @param port Port number to listen.
   * @param handler Callback function for client connection.
   */
  public async open(
    port: number,
    handler: (
      acceptor: WebSocketAcceptor<Header, Provider, Remote>,
    ) => Promise<void>,
  ): Promise<void> {
    //----
    // PRELIMINARIES
    //----
    // POSSIBLE TO OPEN?
    if (this.state_ === WebSocketServer.State.OPEN)
      throw new Error(
        "Error on WebSocketServer.open(): it has already been opened.",
      );
    else if (this.state_ === WebSocketServer.State.OPENING)
      throw new Error(
        "Error on WebSocketServer.open(): it's on opening, wait for a second.",
      );
    else if (this.state_ === WebSocketServer.State.CLOSING)
      throw new Error("Error on WebSocketServer.open(): it's on closing.");
    // DO OPEN
    else if (
      this.server_ === null ||
      this.state_ === WebSocketServer.State.CLOSED
    )
      this.server_ =
        this.options_ !== null
          ? (await NodeModule.https.get()).createServer(this.options_!)
          : (await NodeModule.http.get()).createServer();
    this.protocol_ = new (await NodeModule.ws.get()).default.Server({
      noServer: true,
    });

    // SET STATE
    this.state_ = WebSocketServer.State.OPENING;

    //----
    // OPEN SERVER
    //----
    // PROTOCOL - ADAPTOR & ACCEPTOR
    this.server_.on(
      "upgrade",
      (
        request: http.IncomingMessage,
        netSocket: net.Socket,
        header: Buffer,
      ) => {
        this.protocol_!.handleUpgrade(request, netSocket, header, (socket) =>
          WebSocketAcceptor.upgrade(request, socket, handler),
        );
      },
    );

    // FINALIZATION
    await WebSocketServer._Open(
      this.server_,
      port,
      (state) => (this.state_ = state),
    );
  }

  /**
   * Close server.
   *
   * Close all connections between its remote clients ({@link WebSocketConnector}s).
   *
   * It destroys all RFCs (remote function calls) between this server and remote clients
   * (through `Driver<Controller>`) that are not returned (completed) yet. The destruction
   * causes all incomplete RFCs to throw exceptions.
   */
  public async close(): Promise<void> {
    // VALIDATION
    if (this.state_ !== WebSocketServer.State.OPEN)
      throw new Error(
        "Error on WebSocketServer.close(): server is not opened.",
      );

    // DO CLOSE
    this.state_ = WebSocketServer.State.CLOSING;
    await this._Close();
    this.state_ = WebSocketServer.State.CLOSED;
  }

  /**
   * @hidden
   */
  private static _Open(
    server: http.Server | https.Server,
    port: number,
    setState: (state: WebSocketServer.State) => void,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // PREPARE RETURNS
      server.on("listening", () => {
        setState(WebSocketServer.State.OPEN);
        server.on("error", () => {});
        resolve();
      });
      server.on("error", (error) => {
        setState(WebSocketServer.State.NONE);
        reject(error);
      });

      // DO OPEN - START PROVIDE
      server.listen(port);
    });
  }

  /**
   * @hidden
   */
  private _Close(): Promise<void> {
    return new Promise((resolve) => {
      this.protocol_!.close(() => {
        this.server_!.close(() => {
          resolve();
        });
      });
    });
  }

  /* ----------------------------------------------------------------
    ACCESSORS
  ---------------------------------------------------------------- */
  /**
   * Get server state.
   *
   * Get current state of the websocket server.
   *
   * List of values are such like below:
   *
   *   - `NONE`: The `{@link WebSocketServer} instance is newly created, but did nothing yet.
   *   - `OPENING`: The {@link WebSocketServer.open} method is on running.
   *   - `OPEN`: The websocket server is online.
   *   - `CLOSING`: The {@link WebSocketServer.close} method is on running.
   *   - `CLOSED`: The websocket server is offline.
   */
  public get state(): WebSocketServer.State {
    return this.state_;
  }
}

/**
 *
 */
export namespace WebSocketServer {
  /**
   * Current state of the {@link WebSocketServer}.
   */
  export type State = IServer.State;
}
