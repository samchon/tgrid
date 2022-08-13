/** 
 * @packageDocumentation
 * @module tgrid.protocols.web
 */
//----------------------------------------------------------------
import type http from "http";
import type https from "https";
import type net from "net";
import type WebSocket from "ws";
import { is_node } from "tstl/utility/node";

import { WebAcceptor } from "./WebAcceptor";
import { IServer } from "../internal/IServer";

import { IHeaderWrapper } from "../internal/IHeaderWrapper";
import { DomainError } from "tstl/exception/DomainError";
import { RuntimeError } from "tstl/exception/RuntimeError";
import { NodeModule } from "../../utils/internal/NodeModule";

/**
 * Web Socket Server.
 * 
 *  - available only in the NodeJS.
 * 
 * The `WebServer` is a class who can open an websocket server. Clients connecting to the 
 * `WebServer` would communicate with this server through {@link WebAcceptor} objects using 
 * RFC (Remote Function Call).
 * 
 * To open the websocket server, call the {@link open}() method with your callback function which 
 * would be called whenever a {@link WebAcceptor} has been newly created ay a client's connection.
 * 
 * Also, when declaring this {@link WebServer} type, you've to define two template arguments,
 * *Header* and *Provider*. The *Header* type repersents an initial data gotten from the remote
 * client after the connection. I hope you and client not to omit it and utilize it as an 
 * activation tool to enhance security. 
 * 
 * The second template argument *Provider* represents the features provided for the remote client. 
 * If you don't have any plan to provide any feature to the remote client, just declare it as 
 * `null`.
 * 
 * @template Header Type of header containing initialization data like activation.
 * @template Provider Type of features provided for the remote systems.
 * @author Jeongho Nam - https://github.com/samchon
 */
export class WebServer<Header, Provider extends object | null>
    implements IServer<WebServer.State>
{
    /**
     * @hidden
     */
    private state_: WebServer.State;

    /**
     * @hidden
     */
    private options_: https.ServerOptions | null;

    /**
     * @hidden
     */
    private server_: http.Server | https.Server | null;

    /**
     * @hidden
     */
    private protocol_: WebSocket.Server | null;

    /* ----------------------------------------------------------------
        CONSTRUCTORS
    ---------------------------------------------------------------- */
    /**
     * Default Constructor for the `ws` server..
     * 
     * Create an websocket server (`ws://`).
     */
    public constructor();

    /**
     * Initializer Constructor for the `wss` server.
     * 
     * Create a secured websocket server (`wss://`).
     * 
     * @param key Key string.
     * @param cert Certification string.
     */
    public constructor(key: string, cert: string);

    public constructor(key?: string, cert?: string)
    {
        if (is_node() === false)
            throw new DomainError("Error on WebServer.constructor(): only available in NodeJS.");

        // PREPARE SREVER INSTANCE
        this.options_ = !!key && !!cert
            ? { key, cert }
            : null;

        // INITIALIZE STATUS & PROTOCOL
        this.state_ = WebServer.State.NONE;
        this.server_ = null;
        this.protocol_ = null;
    }

    /**
     * Open websocket server.
     * 
     * Open a server through the web-socket protocol, with its *port* number and *handler* 
     * function determining whether to accept the client's connection or not. After the server has 
     * been opened, clients can connect to that websocket server by using the {@link WebConnector} 
     * class.
     * 
     * When implementing the *handler* function with the {@link WebAcceptor} instance, calls the 
     * {@link WebAcceptor.accept} method if you want to accept the new client's connection. 
     * Otherwise you dont't want to accept the client and reject its connection, just calls the 
     * {@link WebAcceptor.reject} instead.
     * 
     * @param port Port number to listen.
     * @param handler Callback function for client connection.
     */
    public async open
        (
            port: number, 
            handler: (acceptor: WebAcceptor<Header, Provider>) => Promise<void>
        ): Promise<void>
    {
        //----
        // PRELIMINARIES
        //----
        // POSSIBLE TO OPEN?
        if (this.state_ === WebServer.State.OPEN)
            throw new DomainError("Error on WebServer.open(): it has already been opened.");
        else if (this.state_ === WebServer.State.OPENING)
            throw new DomainError("Error on WebServer.open(): it's on opening, wait for a second.");
        else if (this.state_ === WebServer.State.CLOSING)
            throw new RuntimeError("Error on WebServer.open(): it's on closing.");
        
        // DO OPEN
        else if (this.server_ === null || this.state_ === WebServer.State.CLOSED)
            this.server_ = this.options_ !== null
                ? (await NodeModule.https.get()).createServer(this.options_!)
                : (await NodeModule.http.get()).createServer()
        this.protocol_ = new (await NodeModule.ws.get()).default.Server({ noServer:true });

        // SET STATE
        this.state_ = WebServer.State.OPENING;

        //----
        // OPEN SERVER
        //----
        // PROTOCOL - ADAPTOR & ACCEPTOR
        this.server_.on("upgrade", (request: http.IncomingMessage, netSocket: net.Socket, header: Buffer) =>
        {
            this.protocol_!.handleUpgrade(request, netSocket, header, webSocket =>
            {
                webSocket.once("message", async (data: WebSocket.Data) =>
                {
                    // @todo: custom code is required
                    if (typeof data !== "string")
                        webSocket.close();

                    try
                    {
                        const wrapper: IHeaderWrapper<Header> = JSON.parse(data as string);
                        const acceptor: WebAcceptor<Header, Provider> =  WebAcceptor.create(request, webSocket, wrapper.header);
                        
                        await handler(acceptor);
                    }
                    catch (exp)
                    {
                        webSocket.close();
                    }
                });
            });
        });

        // FINALIZATION
        await WebServer._Open(this.server_, port, state => this.state_ = state);
    }

    /**
     * Close server.
     * 
     * Close all connections between its remote clients ({@link WebConnector}s). 
     * 
     * It destories all RFCs (remote function calls) between this server and remote clients 
     * (through `Driver<Controller>`) that are not returned (completed) yet. The destruction 
     * causes all incompleted RFCs to throw exceptions.
     */
    public async close(): Promise<void>
    {
        // VALIDATION
        if (this.state_ !== WebServer.State.OPEN)
            throw new DomainError("Error on WebServer.close(): server is not opened.");

        // DO CLOSE
        this.state_ = WebServer.State.CLOSING;
        await this._Close();
        this.state_ = WebServer.State.CLOSED;
    }

    /**
     * @hidden
     */
    private static _Open
        (
            server: http.Server | https.Server, 
            port: number, 
            setState: (state:WebServer.State) =>void
        ): Promise<void>
    {
        return new Promise((resolve, reject) =>
        {
            // PREPARE RETURNS
            server.on("listening", () =>
            {
                setState(WebServer.State.OPEN);
                server.on("error", () => {});
                resolve();
            });
            server.on("error", error =>
            {
                setState(WebServer.State.NONE);
                reject(error);
            });

            // DO OPEN - START PROVIDE
            server.listen(port);
        });
    }

    /**
     * @hidden
     */
    private _Close(): Promise<void>
    {
        return new Promise(resolve =>
        {
            this.protocol_!.close(() =>
            {
                this.server_!.close(() =>
                {
                    resolve();
                });
            });
        });
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
     *   - `NONE`: The `{@link WebServer} instance is newly created, but did nothing yet.
     *   - `OPENING`: The {@link WebServer.open} method is on running.
     *   - `OPEN`: The websocket server is online.
     *   - `CLOSING`: The {@link WebServer.close} method is on running.
     *   - `CLOSED`: The websocket server is offline.
     */
    public get state(): WebServer.State
    {
        return this.state_;
    }
}

/**
 * 
 */
export namespace WebServer
{
    /**
     * Current state of the {@link WebServer}.
     */
    export import State = IServer.State;
}