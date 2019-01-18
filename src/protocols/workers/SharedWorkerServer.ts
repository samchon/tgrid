//================================================================ 
/** @module tgrid.protocols.workers */
//================================================================
import { IState } from "../internal/IState";
import { SharedWorkerAcceptor } from "./SharedWorkerAcceptor";

import { is_node } from "tstl/utility/node";
import { HashSet } from "tstl/container/HashSet";
import { DomainError } from "tstl/exception";

/**
 * SharedWorker server.
 *  - available only in Web Browser.
 * 
 * The `SharedWorkerServer` is a class representing a server server in a `SharedWorker` 
 * environment. Clients connecting to the `SharedWorkerServer` would communicate with this 
 * server through {@link SharedWorkerAcceptor} objects using RFC (Remote Function Call).
 * 
 * To open the server, use the {@link open}() method with a callback function which would be 
 * called whenever a client has been connected. After your business, don't forget to closing
 * the connection using one of them below. If you don't close that, vulnerable memory usage 
 * and communication channel would not be destroyed and it may cause the memory leak.
 * 
 *  - {@link close}()
 *  - {@link SharedWorkerAcceptor.close}()
 *  - {@link SharedWorkerConnector.close}()
 * 
 * @typeParam Provider Type of features provided for remote system.
 * @wiki https://github.com/samchon/tgrid/wiki/Workers
 * @author Jeongho Nam <http://samchon.org>
 */
export class SharedWorkerServer<Provider extends object = {}>
    implements IState<SharedWorkerServer.State>
{
    /**
     * @hidden
     */
    private acceptors_: HashSet<SharedWorkerAcceptor>;

    /**
     * @hidden
     */
    private state_: SharedWorkerServer.State;

    /* ----------------------------------------------------------------
        CONSTRUCTOR
    ---------------------------------------------------------------- */
    /**
     * Default Constructor.
     */
    public constructor()
    {
        this.acceptors_ = new HashSet();
        this.state_ = SharedWorkerServer.State.NONE;
    }

    /**
     * Open server.
     * 
     * @param handler Callback function called whenever client connects.
     */
    public async open(handler: (acceptor: SharedWorkerAcceptor<Provider>) => any): Promise<void>
    {
        // TEST CONDITION
        if (is_node() === true)
            throw new DomainError("SharedWorker is not supported in the NodeJS.");
        else if (self.document !== undefined)
            throw new DomainError("This is not SharedWorker.");
        else if (this.state_ !== SharedWorkerServer.State.NONE)
            throw new DomainError("Server has opened yet.");

        //----
        // OPE SHARED-WORKER
        //----
        this.state_ = SharedWorkerServer.State.OPENING;
        {
            self.addEventListener("connect", (evt: Event) =>
            {
                for (let port of (evt as OpenEvent).ports)
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
    public async close(): Promise<void>
    {
        // TEST VALIDATION
        if (this.state_ !== SharedWorkerServer.State.OPEN)
            throw new DomainError("Server is not opened.");
        
        // CLOSE ALL CONNECTIONS
        for (let acceptor of this.acceptors_)
            await acceptor.close();
    }

    /**
     * @hidden
     */
    private _Handle_connect(port: MessagePort, handler: (acceptor: SharedWorkerAcceptor<Provider>) => any): void
    {
        let acceptor: SharedWorkerAcceptor<Provider> = null;

        port.onmessage = (evt: MessageEvent) =>
        {
            // CLOSE MESSAGE CHANNEL TEMPORARILY
            port.onmessage = undefined;
            if (acceptor !== null)
                return;

            // ARGUMENTS
            let args: string[] = evt.data;

            // CREATE ACCEPTOR
            acceptor = new AcceptorFactory<Provider>(port, args, () =>
            {
                this.acceptors_.erase(acceptor);
            });
            this.acceptors_.insert(acceptor);

            // SHIFT TO THE CALLBACK
            handler(acceptor);
        };
        port.postMessage("READY");
    }

    /* ----------------------------------------------------------------
        ACCESSORS
    ---------------------------------------------------------------- */
    /**
     * @inheritDoc
     */
    public get state(): SharedWorkerServer.State
    {
        return this.state_;
    }
}

export namespace SharedWorkerServer
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

/**
 * @hidden
 */
type OpenEvent = Event & {ports: MessagePort[]};

/**
 * @hidden
 */
const AcceptorFactory:
{
    new<Provider extends object>
    (
        port: MessagePort, 
        args: string[],
        eraser: ()=>void
    ): SharedWorkerAcceptor<Provider>;
} = <any>SharedWorkerAcceptor;