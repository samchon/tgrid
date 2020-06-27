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
 * @template Headers Type of headers containing initialilzation data like activation.
 * @template Provider Type of features provided for remote system.
 * @author Jeongho Nam - https://github.com/samchon
 */
export abstract class ConnectorBase<
        Headers extends object | null, 
        Provider extends object | null>
    extends Communicator<Provider>
{
    /**
     * @hidden
     */
    private readonly headers_: Headers;

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
     * @param headers An object containing initialization data like activation.
     * @param provider An object providing features for remote system.
     */
    public constructor(headers: Headers, provider: Provider)
    {
        super(provider);

        this.headers_ = headers;
        this.state_ = ConnectorBase.State.NONE;
    }

    /* ----------------------------------------------------------------
        ACCESSORS
    ---------------------------------------------------------------- */
    /**
     * Headers containing initialization data like activation.
     */
    public get headers(): Headers
    {
        return this.headers_;
    }

    /**
     * Connection state with the server.
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
    export const enum State
    {
        NONE = -1,
        CONNECTING,
        OPEN,
        CLOSING,
        CLOSED
    }
}