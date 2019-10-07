//================================================================ 
/** @module tgrid.protocols.workers */
//================================================================
import { Communicator } from "../../components/Communicator";
import { IWorkerSystem } from "./internal/IWorkerSystem";
import { IConnector, Connector } from "../internal/IConnector";

import { Invoke } from "../../components/Invoke";
import { IReject } from "./internal/IReject";
import { compile as _Compile, remove as _Remove } from "./internal/web-worker";

import { DomainError, RuntimeError } from "tstl/exception";
import { Pair } from "tstl/utility/Pair";

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
 * @typeParam Provider Type of features provided for remote system.
 * @author Jeongho Nam <http://samchon.org>
 */
export class SharedWorkerConnector<Provider extends object = {}>
    extends Communicator<Provider | null>
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

    /**
     * @hidden
     */
    private args_?: string[];
    
    /**
     * @hidden
     */
    private connector_?: Pair<()=>void, (error: Error)=>void>;

    /* ----------------------------------------------------------------
        CONSTRUCTOR
    ---------------------------------------------------------------- */
    /**
     * Initializer Constructor.
     * 
     * @param provider An object providing features (functions & objects) for remote system.
     */
    public constructor(provider: Provider | null = null)
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
     * @param args Arguments to deliver.
     */
    public connect(jsFile: string, ...args: string[]): Promise<void>
    {
        return new Promise((resolve, reject) => 
        {
            // TEST CONDITION
            if (this.port_ && this.state_ !== SharedWorkerConnector.State.CLOSED)
            {
                let err: Error;
                if (this.state_ === SharedWorkerConnector.State.CONNECTING)
                    err = new DomainError("On connecting.");
                else if (this.state_ === SharedWorkerConnector.State.OPEN)
                    err = new DomainError("Already connected.");
                else
                    err = new DomainError("Closing.");

                reject(err);
                return;
            }

            //----
            // CONNECTOR
            //----
            try
            {
                // PREPARE MEMBERS
                this.state_ = SharedWorkerConnector.State.CONNECTING;
                this.args_ = args;
                this.connector_ = new Pair(resolve, reject);

                // DO CONNECT
                let worker = new SharedWorker(jsFile);
                
                this.port_ = worker.port;
                this.port_.onmessage = this._Handle_message.bind(this);
                this.port_.start();
            }
            catch (exp)
            {
                this.state_ = SharedWorkerConnector.State.NONE;
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
        this.state_ = SharedWorkerConnector.State.CLOSING;
        this.port_!.postMessage("CLOSE");

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
    protected inspectReady(): Error | null
    {
        return Connector.inspect(this.state_);
    }

    /**
     * @hidden
     */
    private _Handle_message(evt: MessageEvent): void
    {
        // PROCESSES
        if (evt.data === "READY")
            this.port_!.postMessage(this.args_!);
        else if (evt.data === "ACCEPT")
        {
            this.state_ = SharedWorkerConnector.State.OPEN;
            this.connector_!.first();
        }
        else if (evt.data === "CLOSE")
            this._Handle_close();
        else if (evt.data === "REJECT")
            this._Handle_reject("Rejected by server.");

        // RFC OR REJECT
        else
        {
            
            let data: Invoke | IReject = JSON.parse(evt.data);
            if ((data as Invoke).uid !== undefined)
                this.replyData(data as Invoke);
            else
                this._Handle_reject((data as IReject).message);
        }
    }

    /**
     * @hidden
     */
    private async _Handle_reject(reason: string): Promise<void>
    {
        this.state_ = SharedWorkerConnector.State.CLOSING;
        this.connector_!.second(new RuntimeError(reason));

        await this._Handle_close();
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
    export import State = Connector.State;
    
    /**
     * Compile JS source code.
     * 
     * @param content Source code
     * @return Temporary URL.
     */
    export function compile(content: string): string
    {
        return _Compile(content);
    }

    /**
     * Remove compiled JS file.
     * 
     * @param url Temporary URL.
     */
    export function remove(url: string): void
    {
        _Remove(url);
    }
}