//================================================================ 
/** @module tgrid.protocols.web */
//================================================================
import http = require("http");
import https = require("https");
import net = require("net");
import WebSocket = require("ws");

import { DomainError } from "tstl/exception/DomainError";
import { RuntimeError } from "tstl/exception/RuntimeError";

import { IServer } from "../internal/IServer";
import { WebAcceptor } from "./WebAcceptor";

/**
 * Web Socket Server.
 *  - available only in NodeJS.
 * 
 * The `WebServer` is a class who can open an websocket server. Clients connecting to the 
 * `WebServer` would communicate with this server through {@link WebAcceptor} objects using 
 * RFC (Remote Function Call).
 * 
 * To open the server, call the {@link open}() method with a callback function which would be
 * called whenever a client has been connected.
 * 
 * @type Provider Type of features provided for remote systems.
 * @author Jeongho Nam - https://github.com/samchon
 */
export class WebServer<Headers extends object, Provider extends object | null>
    implements IServer<WebServer.State>
{
    /**
     * @hidden
     */
    private state_: WebServer.State;

    /**
     * @hidden
     */
    private options_?: https.ServerOptions;

    /**
     * @hidden
     */
    private server_: http.Server | https.Server;

    /**
     * @hidden
     */
    private protocol_: WebSocket.Server;

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
        // PREPARE SREVER INSTANCE
        if (key)
        {
            this.options_ = ({ key: key, cert: cert });
            this.server_ = https.createServer(this.options_);
        }
        else
            this.server_ = http.createServer();

        // INITIALIZE STATUS & PROTOCOL
        this.state_ = WebServer.State.NONE;
        this.protocol_ = new WebSocket.Server({ noServer: true });
    }

    /**
     * Open websocket server.
     * 
     * @param port Port number to listen.
     * @param handler Callback function for client connection.
     * 
     * @todo should be normalized
     */
    public async open
        (
            port: number, 
            handler: WebServer.ConnectionHandler<Headers, Provider>
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
        
        // RE-OPEN ?
        else if (this.state_ === WebServer.State.CLOSED)
            this.server_ = this.server_ instanceof http.Server
                ? http.createServer()
                : https.createServer(this.options_!);

        // SET STATE
        this.state_ = WebServer.State.OPENING;

        //----
        // OPEN SERVER
        //----
        // PROTOCOL - ADAPTOR & ACCEPTOR
        this.server_.on("upgrade", (request: http.IncomingMessage, netSocket: net.Socket, header: Buffer) =>
        {
            this.protocol_.handleUpgrade(request, netSocket, header, webSocket =>
            {
                webSocket.once("message", async (data: WebSocket.Data) =>
                {
                    // @todo: custom code is required
                    if (typeof data !== "string")
                        webSocket.close();

                    try
                    {
                        let headers: Headers = JSON.parse(data as string);
                        let acceptor: WebAcceptor<Headers, Provider> =  WebAcceptor.create(request, webSocket, headers);
                        
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
        await this._Open(port);
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
    private _Open(port: number): Promise<void>
    {
        return new Promise((resolve, reject) =>
        {
            // PREPARE RETURNS
            this.server_.on("listening", () =>
            {
                this.state_ = WebServer.State.OPEN;
                this.server_.on("error", () => {});
                resolve();
            });
            this.server_.on("error", error =>
            {
                this.state_ = WebServer.State.NONE;
                reject(error);
            });

            // DO OPEN - START PROVIDE
            this.server_.listen(port);
        });
    }

    /**
     * @hidden
     */
    private _Close(): Promise<void>
    {
        return new Promise(resolve =>
        {
            this.server_.close(() =>
            {
                // BE CLOSED
                this.state_ = WebServer.State.CLOSED;
                resolve();
            });
        });
    }

    /* ----------------------------------------------------------------
        ACCESSORS
    ---------------------------------------------------------------- */
    /**
     * @inheritDoc
     */
    public get state(): WebServer.State
    {
        return this.state_;
    }
}

export namespace WebServer
{
    export import State = IServer.State;

    export interface ConnectionHandler<Headers extends object, Provider extends object | null>
    {
        (acceptor: WebAcceptor<Headers, Provider>): Promise<void>;
    }
}