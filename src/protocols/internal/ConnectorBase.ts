/** 
 * @packageDocumentation
 * @module tgrid.protocols
 */
//----------------------------------------------------------------
import { Communicator } from "../../components/Communicator";

import { DomainError } from "tstl/exception/DomainError";
import { RuntimeError } from "tstl/exception/RuntimeError";

/**
 * Basic Connector.
 * 
 * The `ConnectorBase` is an abtract communicator class, who can connect to remote server who 
 * interacts with clients using the RFC (Remote Function Call).
 * 
 * Also, when declaring this {@link ConnectorBase} type, you've to define two template arguments,
 * *Header* and *Provider*. The *Header* type repersents an initial data gotten from the remote
 * client after the connection. I hope you and client not to omit it and utilize it as an 
 * activation tool to enhance security. 
 * 
 * The second template argument *Provider* represents the features provided for the remote client. 
 * If you don't have any plan to provide any feature to the remote client, just declare it as 
 * `null`.
 * 
 * @template Header Type of the header containing initial data.
 * @template Provider Type of additional features provided for the remote system.
 * @author Jeongho Nam - https://github.com/samchon
 */
export abstract class ConnectorBase<Header, Provider extends object | null>
    extends Communicator<Provider>
{
    /**
     * @hidden
     */
    private readonly header_: Header;

    /**
     * @hidden
     */
    protected state_: ConnectorBase.State;

    /* ----------------------------------------------------------------
        CONSTRUCTOR
    ---------------------------------------------------------------- */
    /**
     * Initializer Constructor.
     * 
     * @param header An object containing initialization data like activation.
     * @param provider An object providing features for remote system.
     */
    public constructor(header: Header, provider: Provider)
    {
        super(provider);

        this.header_ = header;
        this.state_ = ConnectorBase.State.NONE;
    }

    /* ----------------------------------------------------------------
        ACCESSORS
    ---------------------------------------------------------------- */
    /**
     * Header containing initialization data like activation.
     */
    public get header(): Header
    {
        return this.header_;
    }

    /**
     * Get state.
     * 
     * Get current state of connection state with the worker server. 
     * 
     * List of values are such like below:
     * 
     *   - `NONE`: This instance is newly created, but did nothing yet.
     *   - `CONNECTING`: The `connect` method is on running.
     *   - `OPEN`: The connection is online.
     *   - `CLOSING`: The `close` method is on running.
     *   - `CLOSED`: The connection is offline.
     */
    public get state(): ConnectorBase.State
    {
        return this.state_;
    }

    /* ----------------------------------------------------------------
        COMMUNICATOR
    ---------------------------------------------------------------- */
    /**
     * @hidden
     */
    protected inspectReady(method: string): Error | null
    {
        // NO ERROR
        if (this.state_ === ConnectorBase.State.OPEN)
            return null;

        // ERROR, ONE OF THEM
        else if (this.state_ === ConnectorBase.State.NONE)
            return new DomainError(`Error on ${this.constructor.name}.${method}(): connect first.`);
        else if (this.state_ === ConnectorBase.State.CONNECTING)
            return new DomainError(`Error on ${this.constructor.name}.${method}(): it's on connecting, wait for a second.`);
        else if (this.state_ === ConnectorBase.State.CLOSING)
            return new RuntimeError(`Error on ${this.constructor.name}.${method}(): the connection is on closing.`);
        else if (this.state_ === ConnectorBase.State.CLOSED)
            return new RuntimeError(`Error on ${this.constructor.name}.${method}(): the connection has been closed.`);

        // UNKNOWN ERROR, IT MAY NOT OCCURED
        else
            return new RuntimeError(`Error on ${this.constructor.name}.${method}(): unknown error, but not connected.`);
    }
}

export namespace ConnectorBase
{
    /**
     * Current state type of connector.
     */
    export const enum State
    {
        NONE = -1,
        CONNECTING,
        OPEN,
        CLOSING,
        CLOSED
    }
}