import { DomainError } from "tstl";

import { Invoke } from "../../components/Invoke";
import { AcceptorBase } from "../internal/AcceptorBase";
import { IReject } from "./internal/IReject";
import { IWorkerSystem } from "./internal/IWorkerSystem";

/**
 * SharedWorker acceptor for client.
 *
 *  - available only in the Web Browser.
 *
 * The `SharedWorkerAcceptor` is a communicator class communicating with the remote client
 * ({@link SharedWorkerConnector}) using RFC (Remote Function Call). The `SharedAcceptor`
 * objects are always created by the {@link SharedWorkerServer} class whenever a remote client
 * connects to its server.
 *
 * To accept connection and start interaction with the remote client, call the {@link accept}
 * method with special `Provider`. After the {@link accept acceptance}, don't forget to closing
 * the connection after your business has been completed. Otherwise, you don't want to accept but
 * reject the connection, call the {@link reject} method.
 *
 * Also, when declaring this {@link SharedWorkerAcceptor} type, you've to define two template
 * arguments, *Header* and *Provider*. The *Header* type repersents an initial data gotten from
 * the remote client after the connection.
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
export class SharedWorkerAcceptor<
    Header,
    Provider extends object | null,
    Remote extends object | null,
  >
  extends AcceptorBase<Header, Provider, Remote>
  implements IWorkerSystem
{
  /**
   * @hidden
   */
  private port_: MessagePort;

  /**
   * @hidden
   */
  private eraser_: () => void;

  /* ----------------------------------------------------------------
    CONSTRUCTOR
  ---------------------------------------------------------------- */
  /**
   * @internal
   */
  public static create<
    Header,
    Provider extends object | null,
    Remote extends object | null,
  >(
    port: MessagePort,
    header: Header,
    eraser: () => void,
  ): SharedWorkerAcceptor<Header, Provider, Remote> {
    return new SharedWorkerAcceptor(port, header, eraser);
  }

  /**
   * @hidden
   */
  private constructor(port: MessagePort, header: Header, eraser: () => void) {
    super(header);

    // ASSIGN MEMBER
    this.port_ = port;
    this.eraser_ = eraser;
  }

  /**
   * @inheritDoc
   */
  public async close(): Promise<void> {
    // TEST CONDITION
    const error: Error | null = this.inspectReady("close");
    if (error) throw error;

    // CLOSE CONNECTION
    this.state_ = SharedWorkerAcceptor.State.CLOSING;
    await this._Close();
  }

  /**
   * @hidden
   */
  private async _Close(reason?: IReject): Promise<void> {
    // DESTRUCTOR
    this.eraser_();
    await this.destructor();

    // DO CLOSE
    setTimeout(() => {
      this.port_.postMessage(
        reason === undefined
          ? SharedWorkerAcceptor.State.CLOSING
          : JSON.stringify(reason),
      );
      this.port_.close();
    });

    // WELL, IT MAY HARD TO SEE SUCH PROPERTIES
    this.state_ = SharedWorkerAcceptor.State.CLOSED;
  }

  /* ----------------------------------------------------------------
    HANDSHAKES
  ---------------------------------------------------------------- */
  /**
   * @inheritDoc
   */
  public async accept(provider: Provider): Promise<void> {
    // TEST CONDITION
    if (this.state_ !== SharedWorkerAcceptor.State.NONE)
      throw new DomainError(
        "Error on SharedWorkerAcceptor.accept(): you've already accepted (or rejected) the connection.",
      );

    //----
    // ACCEPT CONNECTION
    //----
    this.state_ = SharedWorkerAcceptor.State.ACCEPTING;
    {
      // SET PROVIDER
      this.provider_ = provider;

      // PREPARE PORT
      this.port_.onmessage = this._Handle_message.bind(this);
      this.port_.start();

      // INFORM ACCEPTANCE
      this.port_.postMessage(SharedWorkerAcceptor.State.OPEN);
    }
    this.state_ = SharedWorkerAcceptor.State.OPEN;
  }

  /**
   * Reject connection.
   *
   * Reject without acceptance, any interaction. The connection would be closed immediately.
   *
   * @param reason Detailed reason of the rejection. Default is "Rejected by server".
   */
  public async reject(reason: string = "Rejected by server"): Promise<void> {
    // TEST CONDITION
    if (this.state_ !== SharedWorkerAcceptor.State.NONE)
      throw new DomainError(
        "Error on SharedWorkerAcceptor.reject(): you've already accepted (or rejected) the connection.",
      );

    //----
    // REJECT CONNECTION (CLOSE)
    //----
    this.state_ = SharedWorkerAcceptor.State.REJECTING;
    await this._Close({ name: "reject", message: reason });
  }

  /* ----------------------------------------------------------------
    COMMUNICATOR
  ---------------------------------------------------------------- */
  /**
   * @hidden
   */
  protected async sendData(invoke: Invoke): Promise<void> {
    this.port_.postMessage(JSON.stringify(invoke));
  }

  /**
   * @hidden
   */
  private _Handle_message(evt: MessageEvent): void {
    if (evt.data === SharedWorkerAcceptor.State.CLOSING)
      this.close().catch(() => {});
    else this.replyData(JSON.parse(evt.data));
  }
}

/**
 *
 */
export namespace SharedWorkerAcceptor {
  /**
   * Current state of the {@link SharedWorkerAcceptor}.
   */
  export import State = AcceptorBase.State;
}
