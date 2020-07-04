/** 
 * @packageDocumentation
 * @module tgrid.protocols.workers
 */
//----------------------------------------------------------------
import { IServer } from "../internal/IServer";
import { SharedWorkerAcceptor } from "./SharedWorkerAcceptor";

import { IHeaderWrapper } from "../internal/IHeaderWrapper";
import { once } from "../internal/once";

import { DomainError } from "tstl/exception/DomainError";
import { HashSet } from "tstl/container/HashSet";
import { is_node } from "tstl/utility/node";

/**
 * SharedWorker server.
 * 
 *  - available only in the Web Browser.
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
 * Also, when declaring this {@link SharedWorkerServer} type, you've to define two template 
 * arguments, *Header* and *Provider*. The *Header* type repersents an initial data gotten from the 
 * remote client after the connection.
 * 
 * The second template argument *Provider* represents the features provided for the remote client. 
 * If you don't have any plan to provide any feature to the remote client, just declare it as 
 * `null`.
 * 
 * @template Header Type of the header containing initial data.
 * @template Provider Type of features provided for the remote system.
 * @author Jeongho Nam - https://github.com/samchon
 */
export class SharedWorkerServer<Header, Provider extends object | null>
    implements IServer<SharedWorkerServer.State>
{
    /**
     * @hidden
     */
    private state_: SharedWorkerServer.State;

    /**
     * @hidden
     */
    private acceptors_: HashSet<SharedWorkerAcceptor<Header, Provider>>;

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
     * Open shared worker server.
     * 
     * Open a server through the shared worker protocol, with *handler* function determining 
     * whether to accept the client's connection or not. After the server has been opened, clients 
     * can connect to that websocket server by using the {@link SharedWorkerServer} class.
     * 
     * When implementing the *handler* function with the {@link SharedWorkerServer} instance, calls 
     * the {@link SharedWorkerAcceptor.accept} method if you want to accept the new client's 
     * connection. Otherwise you dont't want to accept the client and reject its connection, just 
     * calls the {@link SharedWorkerAcceptor.reject} instead.
     * 
     * @param handler Callback function called whenever client connects.
     */
    public async open
        (
            handler: (acceptor: SharedWorkerAcceptor<Header, Provider>) => Promise<void>
        ): Promise<void>
    {
        // TEST CONDITION
        if (is_node() === true)
            throw new DomainError("Error on SharedWorkerServer.open(): SharedWorker is not supported in the NodeJS.");
        else if (self.document !== undefined)
            throw new DomainError("Error on SharedWorkerServer.open(): this is not the SharedWorker.");
        else if (this.state_ !== SharedWorkerServer.State.NONE)
            throw new DomainError("Error on SharedWorkerServer.open(): the server has been opened yet.");

        //----
        // OPE SHARED-WORKER
        //----
        this.state_ = SharedWorkerServer.State.OPENING;
        {
            self.addEventListener("connect", evt =>
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
            throw new DomainError("Error on SharedWorkerServer.close(): the server is not opened.");
        
        // CLOSE ALL CONNECTIONS
        for (let acceptor of this.acceptors_)
            await acceptor.close();
    }

    /**
     * @hidden
     */
    private _Handle_connect(port: MessagePort, handler: (acceptor: SharedWorkerAcceptor<Header, Provider>) => any): void
    {
        let acceptor: SharedWorkerAcceptor<Header, Provider> | null = null;

        port.onmessage = once(evt =>
        {
            // ARGUMENTS
            let wrapper: IHeaderWrapper<Header> = JSON.parse(evt.data);

            // CREATE ACCEPTOR
            acceptor = SharedWorkerAcceptor.create(port, wrapper.header, () =>
            {
                this.acceptors_.erase(acceptor!);
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
    public get state(): SharedWorkerServer.State
    {
        return this.state_;
    }
}

/**
 * 
 */
export namespace SharedWorkerServer
{
    /**
     * Current state of the {@link SharedWorkerServer}.
     */
    export import State = IServer.State;
}

/**
 * @hidden
 */
type OpenEvent = Event & {ports: MessagePort[]};