//================================================================ 
/** @module tgrid.protocols.web */
//================================================================
import { Communicator } from "../../components/Communicator";
import { IWebCommunicator } from "./internal/IWebCommunicator";
import { IConnector } from "../internal/IConnector";

import { Invoke } from "../../components/Invoke";
import { WebError } from "./WebError";
import { once } from "../internal/once";

import { DomainError } from "tstl/exception/DomainError";
import { is_node } from "tstl/utility/node";
import { sleep_for } from "tstl/thread/global";

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
 * @type Headers Type of headers containing additional information like activation.
 * @type Provider Type of features provided for remote system.
 * @author Jeongho Nam - https://github.com/samchon
 */
export class WebConnector<Headers extends object, Provider extends object | null>
    extends Communicator<Provider | null>
    implements IWebCommunicator, IConnector<WebConnector.State>
{
    /**
     * @hidden
     */
    private socket_?: WebSocket;

    /**
     * @hidden
     */
    private state_: WebConnector.State;

    /* ----------------------------------------------------------------
        CONSTRUCTOR
    ---------------------------------------------------------------- */
    /**
     * Initializer Constructor.
     * 
     * @param provider An object providing features for remote system.
     */
    public constructor(provider: Provider)
    {
        super(provider);
        this.state_ = WebConnector.State.NONE;
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
     * @param headers Headers containing additional info like activation.
     * @param timeout Milliseconds to wait the web-socket server to accept or reject it. If omitted, the waiting would be forever.
     */
    public async connect(url: string, headers: Headers, timeout?: number): Promise<void>
    {
        // TEST CONDITION
        if (this.socket_ && this.state !== WebConnector.State.CLOSED)
            if (this.socket_.readyState === WebConnector.State.CONNECTING)
                throw new DomainError("Error on WebConnector.connect(): already connecting.");
            else if (this.socket_.readyState === WebConnector.State.OPEN)
                throw new DomainError("Error on WebConnector.connect(): already connected.");
            else
                throw new DomainError("Error on WebConnector.connect(): already closing.");

        //----
        // CONNECTION
        //----
        // PREPARE ASSETS
        this.state_ = WebConnector.State.CONNECTING;

        try
        {
            // DO CONNNECT
            this.socket_ = new g.WebSocket(url);
            await this._Wait_connection();
            
            // SEND HEADERS
            this.socket_!.send(JSON.stringify(headers));

            // PROMISED HANDSHAKE
            if (await this._Handshake(timeout) !== WebConnector.State.OPEN.toString())
                throw new WebError(1008, "Error on WebConnector.connect(): target server may not be opened by TGrid. It's not following the TGrid's own handshake rule.");
            
            // SUCCESS
            this.state_ = WebConnector.State.OPEN;
            {
                this.socket_!.onmessage = this._Handle_message.bind(this);
                this.socket_!.onclose = this._Handle_close.bind(this);
                this.socket_!.onerror = () => {};
            }
        }
        catch (exp)
        {
            this.state_ = WebConnector.State.NONE;
            if (this.socket_!.readyState === WebConnector.State.OPEN)
                this.socket_!.close();
            throw exp;
        }
    }

    /**
     * @hidden
     */
    private _Wait_connection(): Promise<WebSocket>
    {
        return new Promise((resolve, reject) =>
        {
            this.socket_!.onopen = () => resolve();
            this.socket_!.onclose = once(evt =>
            {
                reject(new WebError(evt.code, evt.reason));
            });
            this.socket_!.onerror = once(() =>
            {
                reject( new WebError(1006, "Connection refused."));
            });
        });
    }

    /**
     * @inheritDoc
     */
    public async close(code?: number, reason?: string): Promise<void>
    {
        // TEST CONDITION
        let error: Error | null = this.inspectReady("WebConnector.close");
        if (error)
            throw error;
        
        //----
        // CLOSE WITH JOIN
        //----
        // PREPARE JOINER
        let ret: Promise<void> = this.join();
        
        // DO CLOSE
        this.state_ = WebConnector.State.CLOSING;
        this.socket_!.close(code, reason);

        // LAZY RETURN
        await ret;
    }

    /**
     * @hidden
     */
    private _Handshake(timeout?: number): Promise<string>
    {
        return new Promise((resolve, reject) =>
        {
            let completed: boolean = false;
            let expired: boolean = false;

            // TIMEOUT
            if (timeout !== undefined)
                sleep_for(timeout).then(() =>
                {
                    if (completed === false)
                    {
                        reject(new WebError(1008, `Error on WebConnector.connect(): target server is not sending handshake data over ${timeout} milliseconds.`));
                        expired = true;
                    }
                });

            // EVENT LISTENRES
            this.socket_!.onmessage = once(evt =>
            {
                if (expired === false)
                {
                    completed = true;
                    resolve(evt.data);
                }
            });
            this.socket_!.onclose = once(evt =>
            {
                if (expired === false)
                {
                    completed = true;
                    reject(new WebError(evt.code, evt.reason));
                }
            });
            this.socket_!.onerror = once(() =>
            {
                if (expired === false)
                {
                    completed = true;
                    reject( new WebError(1006, "Connection refused.") );
                }
            });
        });
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
        return this.state_;
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
    protected inspectReady(method: string): Error | null
    {
        return IConnector.inspect(this.state, method);
    }

    /**
     * @hidden
     */
    private _Handle_message(evt: MessageEvent): void
    {
        if (typeof evt.data === "string")
        {
            let invoke: Invoke = JSON.parse(evt.data);
            this.replyData(invoke);
        }
    }

    /**
     * @hidden
     */
    private async _Handle_close(event: CloseEvent): Promise<void>
    {
        let error: WebError | undefined = (!event.code || event.code !== 1000)
            ? new WebError(event.code, event.reason)
            : undefined;
        
        this.state_ = WebConnector.State.CLOSED;
        await this.destructor(error);
    }
}

export namespace WebConnector
{
    export import State = IConnector.State;

    export var HANDSHAKE_TIMEOUT: number = 5000;
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