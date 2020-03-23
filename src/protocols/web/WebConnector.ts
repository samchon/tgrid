//================================================================ 
/** @module tgrid.protocols.web */
//================================================================
import { Communicator } from "../../components/Communicator";
import { IWebCommunicator } from "./internal/IWebCommunicator";
import { IConnector } from "../internal/IConnector";

import { Invoke } from "../../components/Invoke";
import { WebError } from "./WebError";

import { DomainError } from "tstl/exception/DomainError";
import { Pair } from "tstl/utility/Pair";
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
 * @author Jeongho Nam - https://github.com/samchon
 */
export class WebConnector<Provider extends object = {}>
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
    private connector_?: Pair<()=>void, (error: Error)=>void>;

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
    public constructor(provider: Provider | null = null)
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
     * @param protocols Protocols to use.
     */
    public async connect(url: string, protocols?: string | string[]): Promise<void>
    {
        // TEST CONDITION
        if (this.socket_ && this.state !== WebConnector.State.CLOSED)
            if (this.socket_.readyState === WebConnector.State.CONNECTING)
                throw new DomainError("Error on WebConnector.connect(): already connecting.");
            else if (this.socket_.readyState === WebConnector.State.OPEN)
                throw new DomainError("Error on WebConnector.connect(): already connected.");
            else
                throw new DomainError("Error on WebConnector.connecotr(): already closing.");

        // PREPARE ASSETS
        this.state_ = WebConnector.State.CONNECTING;
        this.socket_ = new g.WebSocket(url, protocols);

        // FINALIZATION
        await this._Connect();
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
    private _Connect(): Promise<void>
    {
        return new Promise((resolve, reject) =>
        {
            this.socket_!.onclose = this._Handle_close.bind(this);
            this.socket_!.onerror = () => 
            {
                this.state_ = WebConnector.State.NONE;
                reject(new WebError(1006, "Connection refused."));
            }

            this.socket_!.onopen = () =>
            {
                this.connector_ = new Pair(resolve, reject);
                this.socket_!.onmessage = this._Handle_message.bind(this);
                this.socket_!.onerror = () => {};
            };
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
        if (this.state_ === WebConnector.State.CONNECTING && evt.data === WebConnector.State.OPEN.toString())
        {
            this.state_ = WebConnector.State.OPEN;
            this.connector_!.first();
        }
        else
            this.replyData(JSON.parse(evt.data));
    }

    /**
     * @hidden
     */
    private async _Handle_close(event: CloseEvent): Promise<void>
    {
        let error: WebError | undefined = (!event.code || event.code !== 1000)
            ? new WebError(event.code, event.reason)
            : undefined;
        
        let prevState: WebConnector.State = this.state_;
        this.state_ = WebConnector.State.CLOSED;

        if (prevState === WebConnector.State.CONNECTING)
            this.connector_!.second(error!);
        else
            await this.destructor(error);
    }
}

export namespace WebConnector
{
    export import State = IConnector.State;
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