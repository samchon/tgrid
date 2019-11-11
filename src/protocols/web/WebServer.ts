//================================================================ 
/** @module tgrid.protocols.web */
//================================================================
import ws = require("websocket");
import http = require("http");
import https = require("https");

import { IServer } from "../internal/IServer";
import { WebAcceptor } from "./WebAcceptor";
import { DomainError, RuntimeError } from "tstl/exception";

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
 * @typeParam Provider Type of features provided for remote systems.
 * @author Jeongho Nam <http://samchon.org>
 */
export class WebServer<Provider extends object = {}>
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
    private protocol_?: ws.server;

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

        // STATUS AND SOCKET ARE YET
        this.state_ = WebServer.State.NONE;
    }

    /**
     * Open websocket server.
     * 
     * @param port Port number to listen.
     * @param handler Callback function for client connection.
     */
    public open(port: number, handler: (acceptor: WebAcceptor<Provider>) => any): Promise<void>
    {
        return new Promise((resolve, reject) =>
        {
            //----
            // PRELIMINARIES
            //----
            // POSSIBLE TO OPEN?
            if (!(this.state_ === WebServer.State.NONE || this.state_ === WebServer.State.CLOSED))
            {
                let exp!: Error;
                if (this.state_ === WebServer.State.OPEN)
                    exp = new DomainError("Server has already opened.");
                else if (this.state_ === WebServer.State.OPENING)
                    exp = new DomainError("Server is on openeing; wait for a sec.");
                else if (this.state_ === WebServer.State.CLOSING)
                    exp = new RuntimeError("Server is on closing.");

                reject(exp);
                return;
            }
            
            // RE-OPEN ?
            if (this.state_ === WebServer.State.CLOSED)
                this.server_ = this.server_ instanceof http.Server
                    ? http.createServer()
                    : https.createServer(this.options_!);

            // SET STATE
            this.state_ = WebServer.State.OPENING;

            //----
            // OPEN SERVER
            //----
            // PROTOCOL - ADAPTOR & ACCEPTOR
            try
            {
                this.protocol_ = new ws.server({ 
                    httpServer: this.server_, 
                    maxReceivedFrameSize: 100 * MB,
                    maxReceivedMessageSize: 100 * MB 
                });
                this.protocol_.on("request", request =>
                {
                    let acceptor: WebAcceptor<Provider> = WebAcceptor.create<Provider>(request);
                    handler(acceptor);
                });
            }
            catch (exp)
            {
                // FAILED TO OPEN
                this.state_ = WebServer.State.NONE;
                reject(exp);

                return;    
            }

            // PREPARE RETURNS
            this.server_.on("listening", () =>
            {
                this.state_ = WebServer.State.OPEN;
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
     * Close server.
     * 
     * Close all connections between its remote clients ({@link WebConnector}s). 
     * 
     * It destories all RFCs (remote function calls) between this server and remote clients 
     * (through `Driver<Controller>`) that are not returned (completed) yet. The destruction 
     * causes all incompleted RFCs to throw exceptions.
     */
    public close(): Promise<void>
    {
        return new Promise((resolve, reject) =>
        {
            if (this.state_ !== WebServer.State.OPEN)
            {
                // SERVER IS NOT OPENED, OR CLOSED.
                reject(new DomainError("Server is not opened."));
                return;
            }
            
            // START CLOSING
            this.state_ = WebServer.State.CLOSING;
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
}

/**
 * @hidden
 */
const KB = 1024 * 1024;

/**
 * @hidden
 */
const MB = KB * 1024;