import { sleep_until } from "tstl";

import { Invoke } from "../../components/Invoke";
import { ConnectorBase } from "../internal/ConnectorBase";
import { IHeaderWrapper } from "../internal/IHeaderWrapper";
import { once } from "../internal/once";
import { IReject } from "./internal/IReject";
import { IWorkerSystem } from "./internal/IWorkerSystem";
import { WebWorkerCompiler } from "./internal/WebWorkerCompiler";

/**
 * SharedWorker Connector
 *
 *  - available only in the Web Browser.
 *
 * The `SharedWorkerConnector` is a communicator class which connects to an
 * `SharedWorker` instance, and interacts with it through RFC (Remote Function Call)
 * concept.
 *
 * You can connect to the {@link SharedWorkerServer} using {@link connect} method.
 * The interaction would be started if the server accepts your connection by calling
 * the {@link SharedWorkerAcceptor.accept} method. If the remote server rejects your
 * connection through {@link SharedWorkerAcceptor.reject} method, the exception
 * would be thrown.
 *
 * After the connection, don't forget to {@link closing} the connection, if your
 * business logics have been completed, to clean up the resources. Otherwise, the
 * closing must be performed by the remote shared worker server, you can wait the
 * remote server's closing signal through the {@link join} method.
 *
 * Also, when declaring this `SharedWorkerConnector` type, you've to define three
 * generic arguments; `Header`, `Provider` and `Remote`. Those generic arguments must
 * be same with the ones defined in the target {@link WebSocketServer} and
 * {@link SharedWorkerAcceptor} classes (`Provider` and `Remote` must be reversed).
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
 */
export class SharedWorkerConnector<
    Header,
    Provider extends object | null,
    Remote extends object | null,
  >
  extends ConnectorBase<Header, Provider, Remote>
  implements IWorkerSystem
{
  /**
   * @hidden
   */
  private port_?: MessagePort;

  /* ----------------------------------------------------------------
    CONNECTIONS
  ---------------------------------------------------------------- */
  /**
   * Connect to remote server.
   *
   * The {@link connect}() method tries to connect an `SharedWorker` instance. If the
   * `SharedWorker` instance is not created yet, the `SharedWorker` instance would be newly
   * created. After the creation, the `SharedWorker` program must open that server using
   * the {@link SharedWorkerServer.open}() method.
   *
   * After you business has been completed, you've to close the `SharedWorker` using one of
   * them below. If you don't close that, vulnerable memory usage and communication channel
   * would not be destroyed and it may cause the memory leak:
   *
   *  - {@link close}()
   *  - {@link ShareDWorkerAcceptor.close}()
   *  - {@link SharedWorkerServer.close}()
   *
   * @param jsFile JS File to be {@link SharedWorkerServer}.
   * @param options Detailed options like timeout.
   */
  public async connect(
    jsFile: string,
    options: Partial<SharedWorkerConnector.IConnectOptions> = {},
  ): Promise<void> {
    // TEST CONDITION
    if (this.port_ && this.state_ !== SharedWorkerConnector.State.CLOSED) {
      if (this.state_ === SharedWorkerConnector.State.CONNECTING)
        throw new Error(
          "Error on SharedWorkerConnector.connect(): on connecting.",
        );
      else if (this.state_ === SharedWorkerConnector.State.OPEN)
        throw new Error(
          "Error on SharedWorkerConnector.connect(): already connected.",
        );
      else
        throw new Error("Error on SharedWorkerConnector.connect(): closing.");
    }

    //----
    // CONNECTION
    //----
    // TIME LIMIT
    const at: Date | undefined =
      options.timeout !== undefined
        ? new Date(Date.now() + options.timeout)
        : undefined;

    // SET CURRENT STATE
    this.state_ = SharedWorkerConnector.State.CONNECTING;

    try {
      // EXECUTE THE WORKER
      const worker: SharedWorker = new SharedWorker(jsFile);
      this.port_ = worker.port as MessagePort;

      // WAIT THE WORKER TO BE READY
      if (
        (await this._Handshake(options.timeout, at)) !==
        SharedWorkerConnector.State.CONNECTING
      )
        throw new Error(
          `Error on SharedWorkerConnector.connect(): target shared-worker may not be opened by TGrid. It's not following the TGrid's own handshake rule when connecting.`,
        );

      // SEND HEADERS
      this.port_.postMessage(JSON.stringify(IHeaderWrapper.wrap(this.header)));

      // WAIT ACCESSION OR REJECTION
      const last: string | SharedWorkerConnector.State.OPEN =
        await this._Handshake(options.timeout, at);
      if (last === SharedWorkerConnector.State.OPEN) {
        // ACCEPTED
        this.state_ = SharedWorkerConnector.State.OPEN;

        this.port_.onmessage = this._Handle_message.bind(this);
        this.port_.onmessageerror = () => {};
      } else {
        // REJECT OR HANDSHAKE ERROR
        /* eslint-disable */
        let reject: IReject | null = null;
        try {
          reject = JSON.parse(last);
        } catch {}

        if (
          reject &&
          reject.name === "reject" &&
          typeof reject.message === "string"
        )
          throw new Error(reject.message);
        else
          throw new Error(
            `Error on SharedWorkerConnector.connect(): target shared-worker may not be opened by TGrid. It's not following the TGrid's own handshake rule.`,
          );
      }
    } catch (exp) {
      try {
        if (this.port_) this.port_.close();
      } catch {}

      this.state_ = SharedWorkerConnector.State.NONE;
      throw exp;
    }
  }

  /**
   * @hidden
   */
  private _Handshake(timeout?: number, at?: Date): Promise<any> {
    return new Promise((resolve, reject) => {
      let completed: boolean = false;
      let expired: boolean = false;

      if (at !== undefined)
        sleep_until(at).then(() => {
          if (completed === false) {
            reject(
              new Error(
                `Error on SharedWorkerConnector.connect(): target shared-worker is not sending handshake data over ${timeout} milliseconds.`,
              ),
            );
            expired = true;
          }
        });

      this.port_!.onmessage = once((evt) => {
        if (expired === false) {
          completed = true;
          resolve(evt.data);
        }
      });
    });
  }

  /**
   * @inheritDoc
   */
  public async close(): Promise<void> {
    // TEST CONDITION
    const error: Error | null = this.inspectReady("close");
    if (error) throw error;

    //----
    // CLOSE WITH JOIN
    //----
    // PROMISE RETURN
    const ret: Promise<void> = this.join();

    // REQUEST CLOSE TO SERVER
    this.state_ = SharedWorkerConnector.State.CLOSING;
    this.port_!.postMessage(SharedWorkerConnector.State.CLOSING);

    // LAZY RETURN
    await ret;
  }

  /* ----------------------------------------------------------------
    COMMUNICATOR
  ---------------------------------------------------------------- */
  /**
   * @hidden
   */
  protected async sendData(invoke: Invoke): Promise<void> {
    this.port_!.postMessage(JSON.stringify(invoke));
  }

  /**
   * @hidden
   */
  private _Handle_message(evt: MessageEvent): void {
    if (evt.data === SharedWorkerConnector.State.CLOSING) this._Handle_close();
    // RFC OR REJECT
    else {
      const data: Invoke = JSON.parse(evt.data);
      this.replyData(data as Invoke);
    }
  }

  /**
   * @hidden
   */
  private async _Handle_close(): Promise<void> {
    await this.destructor();
    this.state_ = SharedWorkerConnector.State.CLOSED;
  }
}

/**
 *
 */
export namespace SharedWorkerConnector {
  /**
   * Current state of the {@link SharedWorkerConnector}.
   */
  export import State = ConnectorBase.State;

  /**
   * Connection options for the {@link SharedWorkerConnector.connect}.
   */
  export interface IConnectOptions {
    /**
     * Milliseconds to wait the shared-worker server to accept or reject it. If omitted, the waiting would be forever.
     */
    timeout: number;
  }

  /**
   * Compile JS source code.
   *
   * @param content Source code
   * @return Temporary URL.
   */
  export async function compile(content: string): Promise<string> {
    const { compile } = await WebWorkerCompiler();
    return compile(content);
  }

  /**
   * Remove compiled JS file.
   *
   * @param url Temporary URL.
   */
  export async function remove(url: string): Promise<void> {
    const { remove } = await WebWorkerCompiler();
    await remove(url);
  }
}
