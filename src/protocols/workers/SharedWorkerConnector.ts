//================================================================ 
/** @module tgrid.protocols.workers */
//================================================================
import { Communicator } from "../../components/Communicator";
import { IWorkerSystem } from "./internal/IWorkerSystem";
import { IConnector } from "../internal/IConnector";

import { Invoke } from "../../components/Invoke";
import { IReject } from "./internal/IReject";
import WebCompiler from "./internal/web-worker";

import { DomainError } from "tstl/exception/DomainError";
import { RuntimeError } from "tstl/exception/RuntimeError";
import { sleep_until } from "tstl/thread/global";
import { once } from "../internal/once";

/**
 * SharedWorker Connector
 *  - available only in Web Browser.
 * 
 * The `SharedWorkerConnector` is a communicator class, who can connect to an `SharedWorker` 
 * instance and communicate with it using RFC (Remote Function Call), considering the 
 * `SharedWorker` as a remote system ({@link WorkerServer}).
 * 
 * You can connect to an `SharedWorker` instance with {@link connect}() method. If the 
 * `SharedWorker` instance does not exist yet, a new `SharedWorker` instance would be newly
 * created. After the creation, you have to let the `SharedWorker` program to open a sever
 * using the {@link SharedWorkerServer.open}() method. Your connection would be linked with 
 * a {@link SharedWorkerAcceptor} object in the server.
 * 
 * After your business has been completed, you've to close the `SharedWorker` using one of 
 * them below. If you don't close that, vulnerable memory usage and communication channel 
 * would not be destroyed and it may cause the memory leak:
 * 
 *  - {@link close}()
 *  - {@link SharedWorkerAcceptor.close}()
 *  - {@link SharedWorkerServer.close}()
 * 
 * @type Headers Type of headers containing initialization data like activation.
 * @type Provider Type of features provided for remote system.
 * @author Jeongho Nam - https://github.com/samchon
 */
export class SharedWorkerConnector<Headers extends object, Provider extends object | null>
    extends Communicator<Provider>
    implements IWorkerSystem, IConnector<SharedWorkerConnector.State>
{
    /**
     * @hidden
     */
    private state_: SharedWorkerConnector.State;

    /**
     * @hidden
     */
    private port_?: MessagePort;

    /* ----------------------------------------------------------------
        CONSTRUCTOR
    ---------------------------------------------------------------- */
    /**
     * Initializer Constructor.
     * 
     * @param provider An object providing features (functions & objects) for remote system.
     */
    public constructor(provider: Provider)
    {
        super(provider);

        this.state_ = SharedWorkerConnector.State.NONE;
    }

    /**
     * Connect to remote server.
     * 
     * The {@link connect}() method tries to connect an `SharedWorker` instance. If the 
     * `SharedWorker` instance is not created yet, the `SharedWorker` instance would be newly
     * created. After the creation, the `SharedWorker` program must open that server using 
     * the {@link SharedWorkerServer.open}() method.
     * 
     * After you business has been completed, you've to close the `SharedWorker` using one of 
     * them below. If you don't close that, vulnerable memory usage and communication channel 
     * would not be destroyed and it may cause the memory leak:
     * 
     *  - {@link close}()
     *  - {@link ShareDWorkerAcceptor.close}()
     *  - {@link SharedWorkerServer.close}()
     * 
     * @param jsFile JS File to be {@link SharedWorkerServer}.
     * @param headers Headers containing initialization data like activation.
     * @param timeout Milliseconds to wait the shared-worker program to open itself. If omitted, the waiting would be forever.
     */
    public async connect(jsFile: string, headers: Headers, timeout?: number): Promise<void>
    {
        // TEST CONDITION
        if (this.port_ && this.state_ !== SharedWorkerConnector.State.CLOSED)
        {
            if (this.state_ === SharedWorkerConnector.State.CONNECTING)
                throw new DomainError("On connecting.");
            else if (this.state_ === SharedWorkerConnector.State.OPEN)
                throw new DomainError("Already connected.");
            else
                throw new DomainError("Closing.");
        }

        //----
        // CONNECTION
        //----
        // TIME LIMIT
        let at: Date | undefined = (timeout !== undefined)
            ? new Date(Date.now() + timeout)
            : undefined;

        // SET CURRENT STATE
        this.state_ = SharedWorkerConnector.State.CONNECTING;

        try
        {
            // EXECUET THE WORKER
            let worker: SharedWorker = new SharedWorker(jsFile);
            this.port_ = worker.port as MessagePort;

            // WAIT THE WORKER TO BE READY
            if (await this._Handshake(timeout, at) !== SharedWorkerConnector.State.CONNECTING)
                throw new DomainError(`Error on SharedWorkerConnector.connect(): target shared-worker may not be opened by TGrid. It's not following the TGrid's own handshake rule when connecting.`);

            // SEND HEADERS
            this.port_.postMessage(JSON.stringify(headers));

            // WAIT ACCEPTION OR REJECTION
            let last: string | SharedWorkerConnector.State.OPEN = await this._Handshake(timeout, at);
            if (last === SharedWorkerConnector.State.OPEN)
            {
                // ACCEPTED
                this.state_ = SharedWorkerConnector.State.OPEN;

                this.port_.onmessage = this._Handle_message.bind(this);
                this.port_.onmessageerror = () => {};
            }
            else
            {
                // REJECT OR HANDSHAKE ERROR
                let reject: IReject | null = null;
                try
                {
                    reject = JSON.parse(last);
                }
                catch {}

                if (reject && reject.name === "reject" && typeof reject.message === "string")
                    throw new RuntimeError(reject.message);
                else
                    throw new DomainError(`Error on SharedWorkerConnector.connect(): target shared-worker may not be opened by TGrid. It's not following the TGrid's own handshake rule.`);
            }
        }
        catch (exp)
        {
            try
            {
                if (this.port_)
                    this.port_.close();
            }
            catch {}

            this.state_ = SharedWorkerConnector.State.NONE;
            throw exp;
        }
    }
    
    /**
     * @hidden
     */
    private _Handshake(timeout?: number, at?: Date): Promise<any>
    {
        return new Promise((resolve, reject) =>
        {
            let completed: boolean = false;
            let expired: boolean = false;

            if (at !== undefined)
                sleep_until(at).then(() =>
                {
                    if (completed === false)
                    {
                        reject(new DomainError(`Error on SharedWorkerConnector.connect(): target shared-worker is not sending handshake data over ${timeout} milliseconds.`));
                        expired = true;
                    }
                });

            this.port_!.onmessage = once(evt =>
            {
                if (expired === false)
                {
                    completed = true;
                    resolve(evt.data);
                }
            });
        });
    }

    /**
     * @inheritDoc
     */
    public async close(): Promise<void>
    {
        // TEST CONDITION
        let error: Error | null = this.inspectReady("SharedWorkerConnector.close");
        if (error)
            throw error;

        //----
        // CLOSE WITH JOIN
        //----
        // PROMISE RETURN
        let ret: Promise<void> = this.join();

        // REQUEST CLOSE TO SERVER
        this.state_ = SharedWorkerConnector.State.CLOSING;
        this.port_!.postMessage(SharedWorkerConnector.State.CLOSING);

        // LAZY RETURN
        await ret;
    }

    /* ----------------------------------------------------------------
        ACCESSORS
    ---------------------------------------------------------------- */
    /**
     * @inheritDoc
     */
    public get state(): SharedWorkerConnector.State
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
        this.port_!.postMessage(JSON.stringify(invoke));
    }

    /**
     * @hidden
     */
    protected inspectReady(method: string): Error | null
    {
        return IConnector.inspect(this.state_, method);
    }

    /**
     * @hidden
     */
    private _Handle_message(evt: MessageEvent): void
    {
        if (evt.data === SharedWorkerConnector.State.CLOSING)
            this._Handle_close();

        // RFC OR REJECT
        else
        {
            let data: Invoke = JSON.parse(evt.data);
            this.replyData(data as Invoke);
        }
    }

    /**
     * @hidden
     */
    private async _Handle_close(): Promise<void>
    {
        await this.destructor();
        this.state_ = SharedWorkerConnector.State.CLOSED;
    }
}

export namespace SharedWorkerConnector
{
    export import State = IConnector.State;
    
    /**
     * Compile JS source code.
     * 
     * @param content Source code
     * @return Temporary URL.
     */
    export function compile(content: string): Promise<string>
    {
        return WebCompiler.compile(content);
    }

    /**
     * Remove compiled JS file.
     * 
     * @param url Temporary URL.
     */
    export function remove(url: string): Promise<void>
    {
        return WebCompiler.remove(url);
    }
}