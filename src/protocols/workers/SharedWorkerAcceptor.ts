//================================================================ 
/** @module tgrid.protocols.workers */
//================================================================
import { Communicator } from "../../components/Communicator";
import { IWorkerSystem } from "./internal/IWorkerSystem";
import { IAcceptor, Acceptor } from "../internal/IAcceptor";

import { Invoke } from "../../components/Invoke";
import { IReject } from "./internal/IReject";
import { DomainError } from "tstl/exception";

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
 * @author Jeongho Nam <http://samchon.org>
 */
export class SharedWorkerAcceptor<Provider extends object = {}>
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
    private arguments_: string[];

    /* ----------------------------------------------------------------
        CONSTRUCTOR
    ---------------------------------------------------------------- */
    /**
     * @internal
     */
    public static create<Provider extends object>(
            port: MessagePort, 
            args: string[], 
            eraser: ()=>void
        ): SharedWorkerAcceptor<Provider>
    {
        return new SharedWorkerAcceptor(port, args, eraser);
    }

    /**
     * @hidden
     */
    private constructor(port: MessagePort, args: string[], eraser: ()=>void)
    {
        super(undefined);

        // ASSIGN MEMBER
        this.port_ = port;
        this.eraser_ = eraser;
        this.arguments_ = args;

        // PROPERTIES
        this.state_ = SharedWorkerAcceptor.State.NONE;
    }

    /**
     * @inheritDoc
     */
    public async close(): Promise<void>
    {
        // TEST CONDITION
        let error: Error | null = this.inspectReady();
        if (error)
            throw error;

        // CLOSE CONNECTION
        this.state_ = SharedWorkerAcceptor.State.CLOSING;
        await this._Close("CLOSE");
    }

    /**
     * @hidden
     */
    private async _Close(message: "CLOSE" | IReject): Promise<void>
    {
        // DESTRUCTOR
        this.eraser_();
        await this.destructor();

        // DO CLOSE
        setTimeout(() =>
        {
            this.port_.postMessage(message);
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
    public get arguments(): string[]
    {
        return this.arguments_;
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
            throw new DomainError("You've already accepted (or rejected) the connection.");

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
            this.port_.postMessage("ACCEPT");
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
            throw new DomainError("You've already accepted (or rejected) the connection.");

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
        this.port_.postMessage(invoke);
    }
    
    /**
     * @hidden
     */
    protected inspectReady(): Error | null
    {
        return Acceptor.inspect(this.state_);
    }

    /**
     * @hidden
     */
    private _Handle_message(evt: MessageEvent): void
    {
        if (evt.data instanceof Object)
            this.replyData(evt.data);
        else if (evt.data === "CLOSE")
            this.close();
    }
}

export namespace SharedWorkerAcceptor
{
    export import State = Acceptor.State;
}