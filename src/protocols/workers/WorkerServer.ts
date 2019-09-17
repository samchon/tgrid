//================================================================ 
/** @module tgrid.protocols.workers */
//================================================================
import { Communicator } from "../../components/Communicator";
import { IWorkerSystem } from "./internal/IWorkerSystem";

import { Invoke } from "../../components/Invoke";
import { URLVariables } from "../../utils/URLVariables";
import { DomainError, RuntimeError } from "tstl/exception";
import { is_node } from "tstl/utility/node";

/**
 * Worker Server.
 * 
 * The `WorkerServer` is a class representing a `Worker` server who can communicate with 
 * remote client, parent and creator of the `Worker` (anyway {@link WorkerConnector}), using 
 * RFC (Remote Function Call).
 * 
 * Unlike other servers, `WorkerServer` can accept only a client ({@link WorkerConnector})
 * because the worker is dependent on its parent instance (web page, node or parent worker).
 * Thus, `WorkerServer` does not have any acceptor and communicates with client (its parent)
 * by itself.
 * 
 * To start communication with the remote client, call the {@link open}() method with special
 * `Provider`. After your business, don't forget terminating this worker using {@link close}() 
 * or {@link WorkerConnector.close}() method. If you don't terminate it, then vulnerable 
 * memory and communication channel would be kept and it may cause the memory leak.
 * 
 * @typeParam Provider Type of features provided for remote system.
 * @author Jeongho Nam <http://samchon.org>
 */
export class WorkerServer<Provider extends object = {}>
    extends Communicator<Provider | null | undefined>
    implements IWorkerSystem
{
    /**
     * @hidden
     */
    private state_: WorkerServer.State;

    /**
     * @hidden
     */
    private args_?: string[];

    /* ----------------------------------------------------------------
        CONSTRUCTOR
    ---------------------------------------------------------------- */
    /**
     * Default Constructor.
     */
    public constructor()
    {
        super(undefined);
        this.state_ = WorkerServer.State.NONE;
    }

    /**
     * Open server with `Provider`.
     * 
     * Open worker server and start communication with the remote system 
     * ({@link WorkerConnector}). 
     * 
     * Note that, after your business, you should terminate this worker to prevent waste 
     * of memory leak. Close this worker by yourself ({@link close}) or let remote client to 
     * close this worker ({@link WorkerConnector.close}).
     * 
     * @param provider An object providing featrues for the remote system.
     */
    public async open(provider: Provider | null = null): Promise<void>
    {
        // TEST CONDITION
        if (is_node() === false)
        {
            if (self.document !== undefined)
                throw new DomainError("This is not Worker.");    
        }
        else if (global.process.send === undefined)
            throw new DomainError("This is not Child Process.");    
        else if (this.state_ !== WorkerServer.State.NONE)
            throw new DomainError("Server has opened yet.");
        
        // OPEN WORKER
        this.state_ = WorkerServer.State.OPENING;
        {
            this.provider = provider;
            g.onmessage = this._Handle_message.bind(this);
            g.postMessage("READY");
        }
        this.state_ = WorkerServer.State.OPEN;
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

        //----
        // CLOSE WORKER
        //----
        this.state_ = WorkerServer.State.CLOSING;
        {
            // HANDLERS
            g.postMessage("CLOSE");
            await this.destructor();
            
            // DO CLOSE
            g.close();
        }
        this.state_ = WorkerServer.State.CLOSED;
    }

    /* ----------------------------------------------------------------
        ACCESSORS
    ---------------------------------------------------------------- */
    /**
     * @inheritDoc
     */
    public get state(): WorkerServer.State
    {
        return this.state_;
    }

    /**
     * Arguments delivered from the connector.
     */
    public get arguments(): string[]
    {
        if (this.args_ === undefined)
            if (is_node())
                this.args_ = global.process.argv.slice(2);
            else
            {
                let vars: URLVariables = new URLVariables(self.location.href);
                this.args_ = vars.has("__m_pArgs")
                    ? JSON.parse(vars.get("__m_pArgs"))
                    : [];
            }
        return this.args_!;
    }

    /* ----------------------------------------------------------------
        COMMUNICATOR
    ---------------------------------------------------------------- */
    /**
     * @hidden
     */
    protected sendData(invoke: Invoke): void
    {
        g.postMessage(invoke);
    }

    /**
     * @hidden
     */
    protected inspectReady(): Error | null
    {
        // NO ERROR
        if (this.state_ === WorkerServer.State.OPEN)
            return null;

        // ERROR, ONE OF THEM
        else if (this.state_ === WorkerServer.State.NONE)
            return new DomainError("Server is not opened yet.");
        else if (this.state_ === WorkerServer.State.OPENING)
            return new DomainError("Server is on opening; wait for a sec.");
        else if (this.state_ === WorkerServer.State.CLOSING)
            return new RuntimeError("Server is on closing.");

        // MAY NOT BE OCCURED
        else if (this.state_ === WorkerServer.State.CLOSED)
            return new RuntimeError("The server has been closed.");
        else
            return new RuntimeError("Unknown error, but not connected.");
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

export namespace WorkerServer
{
    export const enum State
    {
        NONE = -1,
        OPENING = 0,
        OPEN = 1,
        CLOSING = 2,
        CLOSED = 3
    }
}

//----
// POLYFILL
//----
/**
 * @hidden
 */
const g: IFeature = is_node()
    ? require("./internal/worker-server-polyfill")
    : self;

/**
 * @hidden
 */
interface IFeature
{
    close(): void;
    postMessage(message: any): void;
    onmessage(event: MessageEvent): void;
}