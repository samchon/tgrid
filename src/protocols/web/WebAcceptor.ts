//================================================================ 
/** @module tgrid.protocols.web */
//================================================================
import * as ws from "websocket";

import { CommunicatorBase } from "../../basic/CommunicatorBase";
import { IWebCommunicator } from "./internal/IWebCommunicator";
import { IAcceptor, Acceptor } from "../internal/IAcceptor";

import { Invoke } from "../../basic/Invoke";
import { WebError } from "./WebError";
import { DomainError } from "tstl/exception";

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
 * @wiki https://github.com/samchon/tgrid/wiki/Web-Socket
 * @author Jeongho Nam <http://samchon.org>
 */
export class WebAcceptor<Provider extends object = {}>
    extends CommunicatorBase<Provider>
    implements IWebCommunicator, IAcceptor<WebAcceptor.State, Provider>
{
    /**
     * @hidden
     */
    private request_: ws.request;

    /**
     * @hidden
     */
    private connection_: ws.connection;

    /**
     * @hidden
     */
    private state_: WebAcceptor.State;

    /* ----------------------------------------------------------------
        CONSTRUCTORS
    ---------------------------------------------------------------- */
    /**
     * @hidden
     */
    private constructor(request: ws.request)
    {
        super();
        
        this.request_ = request;
        this.connection_ = null;

        this.state_ = WebAcceptor.State.NONE;
    }

    /**
     * @inheritDoc
     */
    public async close(code: number = 1000, reason?: string): Promise<void>
    {
        // TEST CONDITION
        let error: Error = this.inspector();
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
            this.connection_.close();
        else
            this.connection_.sendCloseFrame(code, reason, true);
        
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
        HANDSHAKES
    ---------------------------------------------------------------- */
    /**
     * @inheritDoc
     */
    public accept(provider: Provider = null): Promise<void>
    {
        return new Promise((resolve, reject) =>
        {
            // TEST CONDITION
            if (this.state_ !== WebAcceptor.State.NONE)
            {
                reject(new DomainError("You've already accepted (or rejected) the connectino."));
                return;
            }

            // PREPARE EVENT LISTENERS
            this.state_ = WebAcceptor.State.ACCEPTING;
            this.request_.on("requestAccepted", connection =>
            {
                this.connection_ = connection;
                this.connection_.on("close", this._Handle_close.bind(this));
                this.connection_.on("message", this._Handle_message.bind(this));

                this.state_ = WebAcceptor.State.OPEN;
                resolve();
            });

            // DO ACCEPT
            try
            {
                this.provider_ = provider;
                this.request_.accept();
            }
            catch (exp)
            {
                this.provider_ = null;
                this.connection_ = null;
                this.state_ = WebAcceptor.State.CLOSED;

                reject(exp);
            }
        });
    }

    /**
     * Reject connection.
     *
     * Reject without acceptance, any interaction. The connection would be closed immediately.
     *
     * @param status Status code.
     * @param reason Detailed reason to reject.
     * @param extraHeaders Extra headers if required.
     */
    public reject(status?: number, reason?: string, extraHeaders?: object): Promise<void>
    {
        return new Promise((resolve, reject) =>
        {
            // TEST CONDITION
            if (this.state_ !== WebAcceptor.State.NONE)
            {
                reject(new DomainError("You've already accepted (or rejected) the connection."));
                return;
            }

            // PREPARE HANDLER
            this.request_.on("requestRejected", async () =>
            {
                await this.destructor();
                resolve();
            });

            // DO REJECT
            this.state_ = WebAcceptor.State.REJECTING;
            this.request_.reject(status, reason, extraHeaders);
        });
    }

    /* ----------------------------------------------------------------
        ACCESSORS
    ---------------------------------------------------------------- */
    public get path(): string
    {
        return this.request_.resource;
    }

    public get protocol(): string
    {
        return this.connection_.protocol;
    }

    public get extensions(): string
    {
        return this.connection_
            .extensions
            .map(elem => elem.name)
            .toString();
    }

    /**
     * @inheritDoc
     */
    public get state(): WebAcceptor.State
    {
        return this.state_;
    }

    /* ----------------------------------------------------------------
        COMMUNICATOR
    ---------------------------------------------------------------- */
    /**
     * @hidden
     */
    protected sender(invoke: Invoke): void
    {
        this.connection_.sendUTF(JSON.stringify(invoke));
    }

    /**
     * @hidden
     */
    protected inspector(): Error
    {
        return Acceptor.inspect(this.state_);
    }

    /**
     * @hidden
     */
    private _Handle_message(message: ws.IMessage): void
    {
        let invoke: Invoke = JSON.parse(message.utf8Data);
        this.replier(invoke);
    }

    /**
     * @hidden
     */
    private async _Handle_close(code: number, reason: string): Promise<void>
    {
        let error: WebError = (code !== 100)
            ? new WebError(code, reason)
            : undefined;
        
        await this.destructor(error);
    }
}

export namespace WebAcceptor
{
    export import State = Acceptor.State;
}