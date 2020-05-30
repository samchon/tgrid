//================================================================ 
/** @module tgrid.protocols.web */
//================================================================
import http = require("http");
import WebSocket = require("ws");

import { Communicator } from "../../components/Communicator";
import { IWebCommunicator } from "./internal/IWebCommunicator";
import { IAcceptor } from "../internal/IAcceptor";

import { Invoke } from "../../components/Invoke";
import { WebError } from "./WebError";

import { DomainError } from "tstl/exception/DomainError";

/**
 * Web Socket Acceptor.
 *  - available only in NodeJS.
 * 
 * The `WebAcceptor` is a communicator class interacting with the remote (web socket) client
 * using RFC (Remote Function Call). The `WebAcceptor` objects are always created by the 
 * {@link WebServer} class whenever a remote client connects to its server.
 * 
 * To accept connection and start interaction with the remote client, call the {@link accept}() 
 * method with special `Provider`. Also, don't forget to closing the connection after your 
 * busines has been completed.
 * 
 * @typeParam Provider Type of features provided for remote system.
 * @author Jeongho Nam - https://github.com/samchon
 */
export class WebAcceptor<Provider extends object = {}, Headers extends object = {}>
    extends Communicator<Provider | null | undefined>
    implements IWebCommunicator, IAcceptor<WebAcceptor.State, Provider>
{
    /**
     * @hidden
     */
    private state_: WebAcceptor.State;

    /**
     * @hidden
     */
    private request_: http.IncomingMessage;

    /**
     * @hidden
     */
    private socket_: WebSocket;

    /**
     * @hidden
     */
    private headers_: Headers;

    /* ----------------------------------------------------------------
        CONSTRUCTORS
    ---------------------------------------------------------------- */
    /**
     * @internal
     */
    public static create<Provider extends object, Headers extends object>
        (request: http.IncomingMessage, socket: WebSocket, headers: Headers): WebAcceptor<Provider, Headers>
    {
        return new WebAcceptor(request, socket, headers);
    }

    /**
     * @hidden
     */
    private constructor(request: http.IncomingMessage, socket: WebSocket, headers: Headers)
    {
        super(undefined);
        
        this.state_ = WebAcceptor.State.NONE;
        this.request_ = request;
        this.socket_ = socket;
        this.headers_ = headers;
    }

    /**
     * @inheritDoc
     */
    public async close(code?: number, reason?: string): Promise<void>
    {
        // TEST CONDITION
        let error: Error | null = this.inspectReady("WebAcceptor.close");
        if (error)
            throw error;
        
        //----
        // CLOSE WITH JOIN
        //----
        // PREPARE LAZY RETURN
        let ret: Promise<void> = this.join();

        // DO CLOSE
        this.state_ = WebAcceptor.State.CLOSING;
        if (code === 1000)
            this.socket_!.close();
        else
            this.socket_!.close(code!, reason!);
        
        // state would be closed in destructor() via _Handle_close()
        await ret;
    }

    /**
     * @hidden
     */
    protected async destructor(error?: Error): Promise<void>
    {
        await super.destructor(error);
        this.state_ = WebAcceptor.State.CLOSED;
    }

    /* ----------------------------------------------------------------
        ACCESSORS
    ---------------------------------------------------------------- */
    public get path(): string
    {
        return this.request_.url!;
    }

    /**
     * @inheritDoc
     */
    public get state(): WebAcceptor.State
    {
        return this.state_;
    }

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
        // VALIDATION
        if (this.state_ !== WebAcceptor.State.NONE)
            throw new DomainError("Error on WebAcceptor.accept(): you've already accepted (or rejected) the connection.");

        // PREPARE ASSETS
        this.state_ = WebAcceptor.State.ACCEPTING;
        this.provider_ = provider;

        // REGISTER EVENTS
        this.socket_.on("message", this._Handle_message.bind(this));
        this.socket_.on("close", this._Handle_close.bind(this));
        this.socket_.send(WebAcceptor.State.OPEN.toString());

        // FINISHED
        this.state_ = WebAcceptor.State.OPEN;
    }

    /**
     * Reject connection.
     *
     * Reject without acceptance, any interaction. The connection would be closed immediately.
     *
     * @param status Status code.
     * @param reason Detailed reason to reject.
     */
    public async reject(status?: number, reason?: string): Promise<void>
    {
        // VALIDATION
        if (this.state_ !== WebAcceptor.State.NONE)
            new DomainError("You've already accepted (or rejected) the connection.");

        // SEND CLOSING FRAME
        this.state_ = WebAcceptor.State.REJECTING;
        this.socket_.close(status, reason);
        
        // FINALIZATION
        await this.destructor();
    }

    /* ----------------------------------------------------------------
        COMMUNICATOR
    ---------------------------------------------------------------- */
    /**
     * @hidden
     */
    protected sendData(invoke: Invoke): void
    {
        this.socket_.send(JSON.stringify(invoke));
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
    private _Handle_message(data: WebSocket.Data): void
    {
        if (typeof data === "string")
        {
            let invoke: Invoke = JSON.parse(data);
            this.replyData(invoke);
        }
    }

    /**
     * @hidden
     */
    private async _Handle_close(code: number, reason: string): Promise<void>
    {
        let error: WebError | undefined = (code !== 100)
            ? new WebError(code, reason)
            : undefined;
        
        await this.destructor(error);
    }
}

export namespace WebAcceptor
{
    export import State = IAcceptor.State;
}