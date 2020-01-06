//================================================================ 
/** @module tgrid.protocols.workers */
//================================================================
import { Communicator } from "../../components/Communicator";
import { IWorkerSystem } from "./internal/IWorkerSystem";
import { IConnector } from "../internal/IConnector";

import { Invoke } from "../../components/Invoke";

import { DomainError } from "tstl/exception";
import { is_node } from "tstl/utility/node";

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
 * @typeParam Provider Type of features provided for remote system.
 * @author Jeongho Nam - https://github.com/samchon
 */
export class WorkerConnector<Provider extends object = {}>
    extends Communicator<Provider | null>
    implements IWorkerSystem, Pick<IConnector<WorkerConnector.State>, "state">
{
    /**
     * @hidden
     */
    private state_: WorkerConnector.State;

    /**
     * @hidden
     */
    private worker_?: Worker;

    /**
     * @hidden
     */
    private connector_?: ()=>void;

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
        
        // ASSIGN MEMBERS
        this.state_ = WorkerConnector.State.NONE;
    }

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
     * @param args Arguments to deliver.
     */
    public async compile(content: string, ...args: string[]): Promise<void>
    {
        //----
        // PRELIMINIARIES
        //----
        // TEST CONDITION
        this._Test_connection();

        // COMPILATION
        let path: string = await Compiler.compile(content);
        let error: Error | null = null; // FOR LAZY-THROWING

        //----
        // CONNECT
        //----
        // TRY CONNECTION
        try
        {
            await this._Connect(path, ...args);
        }
        catch (exp)
        {
            error = exp;
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
     * @param args Arguments to deliver.
     */
    public async connect(jsFile: string, ...args: string[]): Promise<void>
    {
        // TEST CONDITION
        this._Test_connection();

        // DO CONNECT
        await this._Connect(jsFile, ...args);
    }

    /**
     * @hidden
     */
    private _Test_connection(): void
    {
        if (this.worker_ && this.state !== WorkerConnector.State.CLOSED)
        {
            if (this.state_ === WorkerConnector.State.CONNECTING)
                throw new DomainError("On connecting.");
            else if (this.state_ === WorkerConnector.State.OPEN)
                throw new DomainError("Already connected.");
            else
                throw new DomainError("Closing.");
        }
    }

    /**
     * @hidden
     */
    private _Connect(jsFile: string, ...args: string[]): Promise<void>
    {
        return new Promise<void>((resolve, reject) =>
        {
            try
            {
                // SET STATE -> CONNECTING
                this.state_ = WorkerConnector.State.CONNECTING;

                // DO CONNECT
                this.worker_ = Compiler.execute(jsFile, ...args);
                this.worker_.onmessage = this._Handle_message.bind(this);

                // GO RETURN
                this.connector_ = resolve;
            }
            catch (exp)
            {
                this.state_ = WorkerConnector.State.NONE;
                reject(exp);
            }
        });
    }

    /**
     * @inheritDoc
     */
    public async close(): Promise<void>
    {
        // TEST CONDITION
        let error: Error | null = this.inspectReady();
        if (error)
            throw error;

        //----
        // CLOSE WITH JOIN
        //----
        // PROMISE RETURN
        let ret: Promise<void> = this.join();

        // REQUEST CLOSE TO SERVER
        this.state_ = WorkerConnector.State.CLOSING;
        this.worker_!.postMessage(WorkerConnector.State.CLOSING);

        // LAZY RETURN
        await ret;
    }

    /* ----------------------------------------------------------------
        ACCESSORS
    ---------------------------------------------------------------- */
    /**
     * @inheritDoc
     */
    public get state(): WorkerConnector.State
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
        this.worker_!.postMessage(JSON.stringify(invoke));
    }

    /**
     * @hidden
     */
    protected inspectReady(): Error | null
    {
        return IConnector.inspect(this.state_);
    }

    /**
     * @hidden
     */
    private _Handle_message(evt: MessageEvent): void
    {
        if (evt.data === WorkerConnector.State.OPEN)
        {
            this.state_ = WorkerConnector.State.OPEN;
            this.connector_!();
        }
        else if (evt.data === WorkerConnector.State.CLOSING)
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

export namespace WorkerConnector
{
    export import State = IConnector.State;
}

//----
// CAPSULIZATION
//----
/**
 * @hidden
 */
const Compiler: CompilerScope = is_node()
    ? require("./internal/node-worker")
    : require("./internal/web-worker");

/**
 * @hidden
 */
interface CompilerScope
{
    compile(content: string): string | Promise<string>;
    remove(path: string): void | Promise<void>;
    execute(jsFile: string, ...args: string[]): Worker;
}