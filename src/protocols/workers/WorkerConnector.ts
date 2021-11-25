/** 
 * @packageDocumentation
 * @module tgrid.protocols.workers
 */
//----------------------------------------------------------------
import { IWorkerSystem } from "./internal/IWorkerSystem";
import { ConnectorBase } from "../internal/ConnectorBase";

import { Invoke } from "../../components/Invoke";
import { IHeaderWrapper } from "../internal/IHeaderWrapper";
import { once } from "../internal/once";

import { IWorkerCompiler } from "./internal/IWebCompiler";
import { DomainError } from "tstl/exception/DomainError";
import { is_node } from "tstl/utility/node";
import { sleep_until } from "tstl/thread/global";

/**
 * Worker Connector.
 * 
 * The `WorkerConnector` is a communicator class, who can create an `Worker` instance and
 * communicate with it using RFC (Remote Function Call), considering the `Worker` as a 
 * remote system ({@link WorkerServer}).
 * 
 * You can create an `Worker` instance with {@link compile}() or {@link connect}() method.
 * Anyway, after creation of the `Worker` instance, the `Worker` program must open a server
 * using the {@link WorkerServer.open}() method.
 * 
 * Note that, after your business, don't forget terminating the worker using {@link close}() 
 * or {@link WorkerServer.close}(). If you don't terminate it, then vulnerable memory and 
 * communication channel would not be destroyed and it may cause the memory leak.
 * 
 * Also, when declaring this {@link WorkerConnector} type, you've to define two template arguments,
 * *Header* and *Provider*. The *Header* type repersents an initial data gotten from the remote
 * system after the connection. I hope you and server not to omit it and utilize it as an 
 * activation tool to enhance security. 
 * 
 * The second template argument *Provider* represents the features provided for the remote system. 
 * If you don't have any plan to provide any feature to the remote system, just declare it as 
 * `null`.
 * 
 * @template Header Type of header containing initialization data like activation.
 * @template Provider Type of features provided for remote system.
 * @author Jeongho Nam - https://github.com/samchon
 */
export class WorkerConnector<Header, Provider extends object | null>
    extends ConnectorBase<Header, Provider>
    implements IWorkerSystem
{
    /**
     * @hidden
     */
    private worker_?: Worker;

    /* ----------------------------------------------------------------
        CONNECTIONS
    ---------------------------------------------------------------- */
    /**
     * Compile server and connect to there.
     * 
     * The {@link compile} method tries compile JS source code, creates `Worker` instance 
     * with that code connects to the `Worker`. To complete the compilation and connection, 
     * the `Worker` program must open that server using the {@link WorkerServer.open}() 
     * method.
     * 
     * Note that, after your business has been completed, you've to close the `Worker` using 
     * {@link close}() or {@link WorkerServer.close}(). If you don't close that, vulnerable 
     * memory usage and communication channel would not be destroyed and it may cause the 
     * memory leak.
     * 
     * @param content JS Source code to compile.
     * @param timeout Detailed options like timeout.
     */
    public async compile
        (
            content: string, 
            options: Partial<WorkerConnector.IConnectOptions> = {}
        ): Promise<void>
    {
        //----
        // PRELIMINIARIES
        //----
        // TEST CONDITION
        this._Test_connection("compile");

        // COMPILATION
        const path: string = await Compiler.compile(content);
        let error: Error | null = null; // FOR LAZY-THROWING

        //----
        // CONNECT
        //----
        // TRY CONNECTION
        try
        {
            await this._Connect("compile", path, options);
        }
        catch (exp)
        {
            error = exp as Error;
        }

        // REMOVE THE TEMPORARY FILE
        await Compiler.remove(path);

        // LAZY THROWING
        if (error !== null)
            throw error;
    }

    /**
     * Connect to server.
     * 
     * The {@link connect}() method tries to create an `Worker` instance and connect to the 
     * `Worker`. To complete the connection, the `Worker` program must open that server using 
     * the {@link WorkerServer.open}() method.
     * 
     * Note that, after your business has been completed, you've to close the `Worker` using 
     * {@link close}() or {@link WorkerServer.close}(). If you don't close that, vulnerable 
     * memory usage and communication channel would not be destroyed and it may cause the 
     * memory leak.
     * 
     * @param jsFile JS File to be {@link WorkerServer}.
     * @param args Headers containing initialization data like activation.
     * @param timeout Detailed options like timeout.
     */
    public async connect
        (
            jsFile: string, 
            options: Partial<WorkerConnector.IConnectOptions> = {}
        ): Promise<void>
    {
        // TEST CONDITION
        this._Test_connection("connect");

        // DO CONNECT
        await this._Connect("connect", jsFile, options);
    }

    /**
     * @hidden
     */
    private _Test_connection(method: string): void
    {
        if (this.worker_ && this.state !== WorkerConnector.State.CLOSED)
        {
            if (this.state_ === WorkerConnector.State.CONNECTING)
                throw new DomainError(`Error on WorkerConnector.${method}(): on connecting.`);
            else if (this.state_ === WorkerConnector.State.OPEN)
                throw new DomainError(`Error on WorkerConnector.${method}(): already connected.`);
            else
                throw new DomainError(`Error on WorkerConnector.${method}(): closing.`);
        }
    }

    /**
     * @hidden
     */
    private async _Connect
        (
            method: string, 
            jsFile: string, 
            options: Partial<WorkerConnector.IConnectOptions>
        ): Promise<void>
    {
        // TIME LIMIT
        const at: Date | undefined = (options.timeout !== undefined)
            ? new Date(Date.now() + options.timeout)
            : undefined;

        // SET CURRENT STATE
        this.state_ = WorkerConnector.State.CONNECTING;

        try
        {
            // EXECUTE THE WORKER
            this.worker_ = Compiler.execute
            (
                jsFile, 
                is_node() === true
                    ? options.execArgv 
                    : undefined
            );

            // WAIT THE WORKER TO BE READY
            if (await this._Handshake(method, options.timeout, at) !== WorkerConnector.State.CONNECTING)
                throw new DomainError(`Error on WorkerConnector.${method}(): target worker may not be opened by TGrid. It's not following the TGrid's own handshake rule when connecting.`);

            // SEND HEADERS
            this.worker_!.postMessage(JSON.stringify( IHeaderWrapper.wrap(this.header) ));

            // WAIT COMPLETION
            if (await this._Handshake(method, options.timeout, at) !== WorkerConnector.State.OPEN)
                throw new DomainError(`Error on WorkerConnector.${method}(): target worker may not be opened by TGrid. It's not following the TGrid's own handshake rule when connected.`);

            // SUCCESS
            this.state_ = WorkerConnector.State.OPEN;
            this.worker_!.onmessage = this._Handle_message.bind(this);
        }
        catch (exp)
        {
            try
            {
                if (this.worker_)
                    this.worker_.terminate();
            }
            catch {}

            this.state_ = WorkerConnector.State.NONE;
            throw exp;
        }
    }

    /**
     * @hidden
     */
    private _Handshake(method: string, timeout?: number, until?: Date): Promise<number>
    {
        return new Promise((resolve, reject) =>
        {
            let completed: boolean = false;
            let expired: boolean = false;

            if (until !== undefined)
                sleep_until(until).then(() =>
                {
                    if (completed === false)
                    {
                        reject(new DomainError(`Error on WorkerConnector.${method}(): target worker is not sending handshake data over ${timeout} milliseconds.`));
                        expired = true;
                    }
                });

            this.worker_!.onmessage = once(evt =>
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
        const error: Error | null = this.inspectReady("close");
        if (error)
            throw error;

        //----
        // CLOSE WITH JOIN
        //----
        // PROMISE RETURN
        const ret: Promise<void> = this.join();

        // REQUEST CLOSE TO SERVER
        this.state_ = WorkerConnector.State.CLOSING;
        this.worker_!.postMessage(WorkerConnector.State.CLOSING);

        // LAZY RETURN
        await ret;
    }
    
    /* ----------------------------------------------------------------
        COMMUNICATOR
    ---------------------------------------------------------------- */
    /**
     * @hidden
     */
    protected sendData(invoke: Invoke): void
    {
        this.worker_!.postMessage(JSON.stringify(invoke));
    }

    /**
     * @hidden
     */
    private _Handle_message(evt: MessageEvent): void
    {
        if (evt.data === WorkerConnector.State.CLOSING)
            this._Handle_close();
        else
            this.replyData(JSON.parse(evt.data));
    }

    /**
     * @hidden
     */
    private async _Handle_close(): Promise<void>
    {
        // STATE & PROMISE RETURN
        await this.destructor();
        this.state_ = WorkerConnector.State.CLOSED;
    }
}

/**
 * 
 */
export namespace WorkerConnector
{
    /**
     * Current state of the {@link WorkerConnector}.
     */
    export import State = ConnectorBase.State;

    /**
     * Connection options for the {@link WorkerConnector.connect}.
     */
    export interface IConnectOptions
    {
        /**
         * Milliseconds to wait the worker server to accept or reject it. If omitted, the waiting would be forever.
         */
        timeout: number;

        /**
         * Arguments only for the NodeJS environments.
         */
        execArgv: string[];
    }
}

//----
// CAPSULIZATION
//----
/**
 * @hidden
 */
const Compiler: IWorkerCompiler = is_node()
    ? require("./internal/node-worker")
    : require("./internal/web-worker");