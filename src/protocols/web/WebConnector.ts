//================================================================ 
/** @module tgrid.protocols.web */
//================================================================
import { Communicator } from "../../components/Communicator";
import { IWebCommunicator } from "./internal/IWebCommunicator";
import { IConnector, Connector } from "../internal/IConnector";

import { Invoke } from "../../components/Invoke";
import { WebError } from "./WebError";

import { DomainError } from "tstl/exception";
import { is_node } from "tstl/utility/node";

/**
 * Web Socket Connector.
 * 
 * The `WebConnector` is a communicator class who can connect to websocket server and 
 * interact with it using RFC (Remote Function Call).
 * 
 * You can connect to the websocket server using {@link connect}() method. The interaction 
 * would be started if the server is opened by {@link WebServer.open}() and the server 
 * accepts your connection by {@link WebAcceptor.accept}().
 * 
 * Note that, after you business has been completed, please close the connection using 
 * {@link close}() or let the server to {@link WebAcceptor.close close itself}. If you don't 
 * close the connection in time, it may waste vulnerable resources of the server.
 * 
 * @typeParam Provider Type of features provided for remote system.
 * @author Jeongho Nam <http://samchon.org>
 */
export class WebConnector<Provider extends object = {}>
    extends Communicator<Provider | null>
    implements IWebCommunicator, IConnector<WebConnector.State>
{
    /**
     * @hidden
     */
    private socket_?: WebSocket;

    /* ----------------------------------------------------------------
        CONSTRUCTOR
    ---------------------------------------------------------------- */
    /**
     * Initializer Constructor.
     * 
     * @param provider An object providing features for remote system.
     */
    public constructor(provider: Provider | null = null)
    {
        super(provider);
    }

    /**
     * Connect to remote websocket server.
     * 
     * Try connection to the remote websocket server with its address and waiting for the
     * server to accept the trial. If the server rejects your connection, then exception 
     * would be thrown (in *Promise.catch*, as `WebError`).
     * 
     * After the connection and your business has been completed, don't forget to closing the 
     * connection in time to prevent waste of the server resource.
     * 
     * @param url URL address to connect.
     * @param protocols Protocols to use.
     */
    public connect(url: string, protocols?: string | string[]): Promise<void>
    {
        return new Promise((resolve, reject) =>
        {
            // TEST CONDITION
            if (this.socket_ && this.state !== WebConnector.State.CLOSED)
            {
                let err: Error;
                if (this.socket_.readyState === WebConnector.State.CONNECTING)
                    err = new DomainError("On connection.");
                else if (this.socket_.readyState === WebConnector.State.OPEN)
                    err = new DomainError("Already connected.");
                else
                    err = new DomainError("Closing.");

                reject(err);
                return;
            }

            //----
            // CONNECTOR
            //----
            // OPEN A SOCKET
            try
            {
                this.socket_ = new g.WebSocket(url, protocols);
            }
            catch (exp)
            {
                reject(exp);
                return;
            }

            // SET EVENT HANDLERS
            this.socket_.onopen = () =>
            {
                // RE-DEFINE HANDLERS
                this.socket_!.onerror = this._Handle_error.bind(this);
                this.socket_!.onmessage = this._Handle_message.bind(this);
                
                // RETURNS
                resolve();
            };
            this.socket_.onclose = this._Handle_close.bind(this);
            this.socket_.onerror = () =>
            {
                reject(new WebError(1006, "Connection refused."));
            };
        });
    }

    /**
     * @inheritDoc
     */
    public async close(code?: number, reason?: string): Promise<void>
    {
        // TEST CONDITION
        let error: Error | null = this.inspectReady();
        if (error)
            throw error;
        
        //----
        // CLOSE WITH JOIN
        //----
        // DO CLOSE
        let ret: Promise<void> = this.join();
        this.socket_!.close(code, reason);

        // LAZY RETURN
        await ret;
    }

    /* ----------------------------------------------------------------
        ACCESSORS
    ---------------------------------------------------------------- */
    public get url(): string | undefined
    {
        return this.socket_ ? this.socket_.url : undefined;
    }
    
    /**
     * @inheritDoc
     */
    public get state(): WebConnector.State
    {
        return this.socket_ ? this.socket_.readyState : WebConnector.State.NONE;
    }

    /* ----------------------------------------------------------------
        COMMUNICATOR
    ---------------------------------------------------------------- */
    /**
     * @hidden
     */
    protected sendData(invoke: Invoke): void
    {
        this.socket_!.send(JSON.stringify(invoke));
    }

    /**
     * @hidden
     */
    protected inspectReady(): Error | null
    {
        return Connector.inspect(this.state);
    }

    /**
     * @hidden
     */
    private _Handle_message(evt: MessageEvent): void
    {
        this.replyData(JSON.parse(evt.data));
    }

    /**
     * @hidden
     */
    private _Handle_error({}: Event): void
    {
        // HANDLING ERRORS ON CONNECTION, 
        // THAT'S NOT IMPLEMENTED YET
    }

    /**
     * @hidden
     */
    private async _Handle_close(event: CloseEvent): Promise<void>
    {
        let error: WebError | undefined = (!event.code || event.code !== 1000)
            ? new WebError(event.code, event.reason)
            : undefined;
        
        await this.destructor(error);
    }
}

export namespace WebConnector
{
    export import State = Connector.State;
}

//----
// POLYFILL
//----
/**
 * @hidden
 */
const g: IFeature = is_node()
    ? require("./internal/websocket-polyfill")
    : <any>self;

/**
 * @hidden
 */
interface IFeature
{
    WebSocket: WebSocket &
    {
        new(url: string, protocols?: string | string[]): WebSocket;
    };
}