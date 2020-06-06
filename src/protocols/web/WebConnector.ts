//================================================================ 
/** @module tgrid.protocols.web */
//================================================================
import { Communicator } from "../../components/Communicator";
import { IWebCommunicator } from "./internal/IWebCommunicator";
import { IConnector } from "../internal/IConnector";

import { Invoke } from "../../components/Invoke";
import { WebError } from "./WebError";

import { DomainError } from "tstl/exception/DomainError";
import { Latch } from "tstl/thread/Latch";
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
     * @param headers Headers containing additional info like activation.
     */
    public async connect<Headers extends object = {}>
        (url: string, headers: Headers = {} as Headers): Promise<void>
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
        this.socket_ = new g.WebSocket(url);

        // FINALIZATION
        await this._Connect(headers);
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
    private _Connect<Headers extends object>(headers: Headers): Promise<void>
    {
        return new Promise((resolve, reject) =>
        {
            // WHEN FAILED TO CONNECT
            this.socket_!.onerror = () => 
            {
                this.state_ = WebConnector.State.NONE;
                reject( new WebError(1006, "Connection refused.") );
            };

            // SUCCEEDED TO CONNECT
            this.socket_!.onopen = async () =>
            {
                // PREPARE CONDITION-VARIABLE FOR JOINING
                let latch: Latch = new Latch(1);
                let error: WebError | null = null;
                
                //----
                // CONFIGURE EVENTS
                //----
                // IGNORE ERROR
                this.socket_!.onerror = () => {};

                // HANDSHAKE MESSAGE
                this.socket_!.onmessage = async evt =>
                {
                    if (evt.data !== WebConnector.State.OPEN.toString())
                        error = new WebError(1008, "Error on WebConnector.connect(): target server may not be opened by TGrid. It's not following the TGrid's own handshake rule.");
                    await latch.count_down();
                };

                // CLOSED DURING HANDSHAKE
                this.socket_!.onclose = async evt => 
                {
                    error = new WebError(evt.code, evt.reason);
                    await latch.count_down();
                };

                //----
                // FINALIZATION
                //----
                // SEND HANDSHAKE MESSAGE
                this.socket_!.send(JSON.stringify(headers));

                // JOIN RESPONSE
                if (await latch.wait_for(WebConnector.HANDSHAKE_TIMEOUT) === false)
                    error = new WebError(1008, `Error on WebConnector.connect(): target server is not sending handshake data over ${WebConnector.HANDSHAKE_TIMEOUT} milliseconds.`);
                
                if (error === null)
                {
                    // SUCCESS
                    this.socket_!.onmessage = this._Handle_message.bind(this);
                    this.socket_!.onclose = this._Handle_close.bind(this);

                    // SUCCESS
                    this.state_ = WebConnector.State.OPEN;
                    resolve();
                }
                else
                {
                    // FAILURE
                    if (this.socket_!.readyState === g.WebSocket.OPEN)
                    {
                        this.state_ = WebConnector.State.CLOSING;
                        this.socket_!.onclose = () => 
                        {
                            this.state_ = WebConnector.State.CLOSED;
                            reject(error);
                        };
                        this.socket_!.close(error.status, error.message);
                    }
                    else
                    {
                        this.state_ = WebConnector.State.CLOSED;
                        reject(error);
                    }
                }
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