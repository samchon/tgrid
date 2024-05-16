import { DomainError, HashSet, is_node } from "tstl";

import { IHeaderWrapper } from "../internal/IHeaderWrapper";
import { IServer } from "../internal/IServer";
import { once } from "../internal/once";
import { SharedWorkerAcceptor } from "./SharedWorkerAcceptor";

/**
 * SharedWorker server.
 *
 *  - available only in the Web Browser.
 *
 * The `SharedWorkerServer` is a class representing a server in `SharedWorker`
 * environment. Clients connecting to the `SharedWorkerServer` would communicate
 * with this server through {@link SharedWorkerAcceptor} instaces using RPC
 * (Remote Procedure Call) concept.
 *
 * To open the server, call the {@link open} method with your callback function
 * which would be called whenever a {@link SharedWorkerAcceptor} has been newly
 * created by a new client's connection.
 *
 * Also, when declaring this `SharedWorkerServer` type, you have to define three
 * generic arguments; `Header`, `Provider` and `Remote`. Those generic arguments
 * would be propagated to the {@link SharedWorkerAcceptor}, so that
 * {@link SharedWorkerAcceptor} would have the same generic arguments, too.
 *
 * For reference, the first `Header` type repersents an initial data from the
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
export class SharedWorkerServer<
  Header,
  Provider extends object | null,
  Remote extends object | null,
> implements IServer<SharedWorkerServer.State>
{
  /**
   * @hidden
   */
  private state_: SharedWorkerServer.State;

  /**
   * @hidden
   */
  private acceptors_: HashSet<SharedWorkerAcceptor<Header, Provider, Remote>>;

  /* ----------------------------------------------------------------
    CONSTRUCTOR
  ---------------------------------------------------------------- */
  /**
   * Default Constructor.
   */
  public constructor() {
    this.acceptors_ = new HashSet();
    this.state_ = SharedWorkerServer.State.NONE;
  }

  /**
   * Open shared worker server.
   *
   * Open a server through the shared worker protocol, with *handler* function
   * determining whether to accept the client's connection or not. After the server
   * has been opened, clients can connect to that server by using the
   * {@link SharedWorkerServer} class.
   *
   * When implementing the *handler* function with the {@link SharedWorkerServer}
   * instance, calls the {@link SharedWorkerAcceptor.accept} method if you want to
   * accept the new client's connection. Otherwise you dont't want to accept the
   * client and reject its connection, just calls the
   * {@link SharedWorkerAcceptor.reject} instead.
   *
   * @param handler Callback function called whenever client connects.
   */
  public async open(
    handler: (
      acceptor: SharedWorkerAcceptor<Header, Provider, Remote>,
    ) => Promise<void>,
  ): Promise<void> {
    // TEST CONDITION
    if (is_node() === true)
      throw new DomainError(
        "Error on SharedWorkerServer.open(): SharedWorker is not supported in the NodeJS.",
      );
    else if (self.document !== undefined)
      throw new DomainError(
        "Error on SharedWorkerServer.open(): this is not the SharedWorker.",
      );
    else if (this.state_ !== SharedWorkerServer.State.NONE)
      throw new DomainError(
        "Error on SharedWorkerServer.open(): the server has been opened yet.",
      );

    //----
    // OPE SHARED-WORKER
    //----
    this.state_ = SharedWorkerServer.State.OPENING;
    {
      self.addEventListener("connect", (evt) => {
        for (const port of (evt as OpenEvent).ports)
          this._Handle_connect(port, handler);
      });
    }
    this.state_ = SharedWorkerServer.State.OPEN;
  }

  /**
   * Close server.
   *
   * Close all connections between its remote clients ({@link SharedWorkerConnector}s).
   *
   * It destories all RFCs (remote function calls) between this server and remote clients
   * (through `Driver<Controller>`) that are not returned (completed) yet. The destruction
   * causes all incompleted RFCs to throw exceptions.
   */
  public async close(): Promise<void> {
    // TEST VALIDATION
    if (this.state_ !== SharedWorkerServer.State.OPEN)
      throw new DomainError(
        "Error on SharedWorkerServer.close(): the server is not opened.",
      );

    // CLOSE ALL CONNECTIONS
    for (const acceptor of this.acceptors_) await acceptor.close();
  }

  /**
   * @hidden
   */
  private _Handle_connect(
    port: MessagePort,
    handler: (acceptor: SharedWorkerAcceptor<Header, Provider, Remote>) => any,
  ): void {
    port.onmessage = once((evt) => {
      // ARGUMENTS
      const wrapper: IHeaderWrapper<Header> = JSON.parse(evt.data);

      // CREATE ACCEPTOR
      /* eslint-disable */
      let acceptor: SharedWorkerAcceptor<Header, Provider, Remote>;
      acceptor = SharedWorkerAcceptor.create(port, wrapper.header, () => {
        this.acceptors_.erase(acceptor);
      });
      this.acceptors_.insert(acceptor);

      // SHIFT TO THE CALLBACK
      handler(acceptor);
    });
    port.postMessage(SharedWorkerServer.State.OPENING);
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
   *   - `NONE`: The `{@link SharedWorkerServer} instance is newly created, but did nothing yet.
   *   - `OPENING`: The {@link SharedWorkerServer.open} method is on running.
   *   - `OPEN`: The websocket server is online.
   *   - `CLOSING`: The {@link SharedWorkerServer.close} method is on running.
   *   - `CLOSED`: The websocket server is offline.
   */
  public get state(): SharedWorkerServer.State {
    return this.state_;
  }
}

/**
 *
 */
export namespace SharedWorkerServer {
  /**
   * Current state of the {@link SharedWorkerServer}.
   */
  export import State = IServer.State;
}

/**
 * @hidden
 */
type OpenEvent = Event & { ports: MessagePort[] };
