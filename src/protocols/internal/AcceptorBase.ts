import { Communicator } from "../../components/Communicator";

/**
 * Basic Acceptor.
 *
 * The `AcceptorBase` is an abstract acceptor class, who can accept or reject connection from
 * a remote client in the server side. If the client's connection has been accepted, the
 * `AcceptorBase` can start interaction with the client through the
 * [RFC](https://github.com/samchon/tgrid#13-remote-function-call) (Remote Function Call).
 *
 * Also, when declaring this {@link AcceptorBase} type, you've to define two template arguments,
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
export abstract class AcceptorBase<
  Header,
  Provider extends object | null,
  Remote extends object | null,
> extends Communicator<Provider | undefined, Remote> {
  /**
   * @hidden
   */
  private readonly header_: Header;

  /**
   * @hidden
   */
  protected state_: AcceptorBase.State;

  /* ----------------------------------------------------------------
    CONSTRUCTORS
  ---------------------------------------------------------------- */
  /**
   * @hidden
   */
  protected constructor(header: Header) {
    super(undefined);

    this.header_ = header;
    this.state_ = AcceptorBase.State.NONE;
  }

  /**
   * Accept connection.
   *
   * Accepts (permits) the client's connection with this server and starts interaction.
   *
   * @param provider An object providing features for remote system.
   */
  protected abstract accept(provider: Provider | null): Promise<void>;

  /* ----------------------------------------------------------------
    ACCESSORS
  ---------------------------------------------------------------- */
  /**
   * Header containing initialization data like activation.
   */
  public get header(): Header {
    return this.header_;
  }

  /**
   * Get state.
   *
   * Get current state of connection state with the remote client.
   *
   * List of values are such like below:
   *
   *   - `REJECTING`: The `reject` method is on running.
   *   - `NONE`: This instance is newly created, but did nothing yet.
   *   - `ACCEPTING`: The `accept` method is on running.
   *   - `OPEN`: The connection is online.
   *   - `CLOSING`: The `close` method is on running.
   *   - `CLOSED`: The connection is offline.
   */
  public get state(): AcceptorBase.State {
    return this.state_;
  }

  /**
   * @hidden
   */
  protected inspectReady(method: string): Error | null {
    // NO ERROR
    if (this.state_ === AcceptorBase.State.OPEN) return null;
    // ERROR, ONE OF THEM
    else if (this.state_ === AcceptorBase.State.NONE)
      return new Error(
        `Error on ${this.constructor.name}.${method}(): not accepted yet.`,
      );
    else if (this.state_ === AcceptorBase.State.ACCEPTING)
      return new Error(
        `Error on ${this.constructor.name}.${method}(): it's on accepting, wait for a second.`,
      );
    else if (
      this.state_ === AcceptorBase.State.REJECTING ||
      this.state_ === AcceptorBase.State.CLOSING
    )
      return new Error(
        `Error on ${this.constructor.name}.${method}(): the connection is on closing.`,
      );
    else if (this.state_ === AcceptorBase.State.CLOSED)
      return new Error(
        `Error on ${this.constructor.name}.${method}(): the connection has been closed.`,
      );
    // UNKNOWN ERROR, IT MAY NOT OCCURED
    else
      return new Error(
        `Error on ${this.constructor.name}.${method}(): unknown error, but not connected.`,
      );
  }
}

export namespace AcceptorBase {
  /**
   * Current state type of acceptor.
   */
  export const enum State {
    REJECTING = -2,
    NONE,
    ACCEPTING,
    OPEN,
    CLOSING,
    CLOSED,
  }
}
