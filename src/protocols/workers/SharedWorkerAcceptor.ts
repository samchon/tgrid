//================================================================ 
/** @module tgrid.protocols.workers */
//================================================================
import { Communicator } from "../../components/Communicator";
import { IWorkerSystem } from "./internal/IWorkerSystem";
import { IAcceptor } from "../internal/IAcceptor";

import { Invoke } from "../../components/Invoke";
import { IReject } from "./internal/IReject";
import { DomainError } from "tstl/exception/DomainError";

/**
 * SharedWorker acceptor for client.
 *  - available only in Web Browser.
 * 
 * The `SharedWorkerAcceptor` is a communicator class communicating with the remote client 
 * ({@link SharedWorkerConnector}) using RFC (Remote Function Call). The `SharedAcceptor` 
 * objects are always created by the {@link SharedWorkerServer} class whenever a remote client
 * connects to its server.
 * 
 * To accept connection and start interaction with the remote client, call the {@link accept}() 
 * method with special `Provider`. Also, don't forget to closing the connection after your 
 * business has been completed.
 * 
 * @typeParam Provider Type of features provided for remote system.
 * @author Jeongho Nam - https://github.com/samchon
 */
export class SharedWorkerAcceptor<Provider extends object = {}, Headers extends object = {}>
    extends Communicator<Provider | null | undefined>
    implements IWorkerSystem, IAcceptor<SharedWorkerAcceptor.State, Provider>
{
    /**
     * @hidden
     */
    private port_: MessagePort;

    /**
     * @hidden 
     */
    private eraser_: ()=>void;

    /** 
     * @hidden
     */
    private state_: SharedWorkerAcceptor.State;

    /**
     * @hidden
     */
    private headers_: Headers;

    /* ----------------------------------------------------------------
        CONSTRUCTOR
    ---------------------------------------------------------------- */
    /**
     * @internal
     */
    public static create<Provider extends object, Headers extends object>(
            port: MessagePort, 
            headers: Headers, 
            eraser: ()=>void
        ): SharedWorkerAcceptor<Provider>
    {
        return new SharedWorkerAcceptor(port, headers, eraser);
    }

    /**
     * @hidden
     */
    private constructor(port: MessagePort, headers: Headers, eraser: ()=>void)
    {
        super(undefined);

        // ASSIGN MEMBER
        this.port_ = port;
        this.eraser_ = eraser;
        this.headers_ = headers;

        // PROPERTIES
        this.state_ = SharedWorkerAcceptor.State.NONE;
    }

    /**
     * @inheritDoc
     */
    public async close(): Promise<void>
    {
        // TEST CONDITION
        let error: Error | null = this.inspectReady("SharedWorkerAcceptor.close");
        if (error)
            throw error;

        // CLOSE CONNECTION
        this.state_ = SharedWorkerAcceptor.State.CLOSING;
        await this._Close();
    }

    /**
     * @hidden
     */
    private async _Close(reason?: IReject): Promise<void>
    {
        // DESTRUCTOR
        this.eraser_();
        await this.destructor();

        // DO CLOSE
        setTimeout(() =>
        {
            this.port_.postMessage(reason === undefined
                ? SharedWorkerAcceptor.State.CLOSING
                : JSON.stringify(reason));
            this.port_.close();
        });

        // WELL, IT MAY HARD TO SEE SUCH PROPERTIES
        this.state_ = SharedWorkerAcceptor.State.CLOSED;
    }

    /* ----------------------------------------------------------------
        ACCESSORS
    ---------------------------------------------------------------- */
    /**
     * @inheritDoc
     */
    public get state(): SharedWorkerAcceptor.State
    {
        return this.state_;
    }

    /**
     * Arguments delivered from the connector.
     */
    public get headers(): Headers
    {
        return this.headers_;
    }

    /* ----------------------------------------------------------------
        HANDSHAKES
    ---------------------------------------------------------------- */
    /**
     * @inheritDoc
     */
    public async accept(provider: Provider | null = null): Promise<void>
    {
        // TEST CONDITION
        if (this.state_ !== SharedWorkerAcceptor.State.NONE)
            throw new DomainError("Error on SharedWorkerAcceptor.accept(): you've already accepted (or rejected) the connection.");

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
    public async reject(reason: string = "Rejected by server"): Promise<void>
    {
        // TEST CONDITION
        if (this.state_ !== SharedWorkerAcceptor.State.NONE)
            throw new DomainError("Error on SharedWorkerAcceptor.reject(): you've already accepted (or rejected) the connection.");

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
    protected sendData(invoke: Invoke): void
    {
        this.port_.postMessage(JSON.stringify(invoke));
    }
    
    /**
     * @hidden
     */
    protected inspectReady(method: string): Error | null
    {
        return IAcceptor.inspect(this.state_, method);
    }

    /**
     * @hidden
     */
    private _Handle_message(evt: MessageEvent): void
    {
        if (evt.data === SharedWorkerAcceptor.State.CLOSING)
            this.close();
        else
            this.replyData(JSON.parse(evt.data));
    }
}

export namespace SharedWorkerAcceptor
{
    export import State = IAcceptor.State;
}