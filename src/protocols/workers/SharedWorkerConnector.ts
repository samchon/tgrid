//================================================================ 
/** @module tgrid.protocols.workers */
//================================================================
import { CommunicatorBase } from "../../basic/CommunicatorBase";
import { IWorkerSystem } from "./internal/IWorkerSystem";
import { IConnector } from "../internal/IConnector";
import { Invoke } from "../../basic/Invoke";

import { ConditionVariable } from "tstl/thread/ConditionVariable";
import { DomainError, RuntimeError } from "tstl/exception";
import { Pair } from "tstl/utility/Pair";

import { compile as _Compile, remove as _Remove } from "./internal/web-worker";

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
 * Note that, although you called the {@link connect}() method and the connection has been 
 * succeded, it means only server {@link SharedWorkerAcceptor.accept accepted} your connection
 * request. The acceptance does not mean that server is ready to start communication directly. 
 * The server would be ready when it calls the {@link SharedWorkerAcceptor.listen}() method. 
 * If you want to ensure the server to be ready, call the {@link wait}() method.
 * 
 * After your business has been completed, you've to close the `SharedWorker` using one of 
 * them below. If you don't close that, vulnerable memory usage and communication channel 
 * would not be destroyed and it may cause the memory leak:
 * 
 *  - {@link close}()
 *  - {@link SharedWorkerAcceptor.close}()
 *  - {@link SharedWorkerServer.close}()
 * 
 * @wiki https://github.com/samchon/tgrid/wiki/Workers
 * @author Jeongho Nam <http://samchon.org>
 */
export class SharedWorkerConnector<Provider extends Object = {}>
	extends CommunicatorBase<Provider>
	implements IWorkerSystem, IConnector<SharedWorkerConnector.State>
{
	/**
	 * @hidden
	 */
	private port_: MessagePort;

	/**
	 * @hidden
	 */
	private state_: SharedWorkerConnector.State;

	/**
	 * @hidden
	 */
	private wait_cv_: ConditionVariable;

	/**
	 * @hidden
	 */
	private server_is_listening_: boolean;
	
	/**
	 * @hidden
	 */
	private connector_: Pair<()=>void, (error: Error)=>void>;

	/* ----------------------------------------------------------------
		CONSTRUCTOR
	---------------------------------------------------------------- */
	/**
	 * Initializer Constructor.
	 * 
	 * @param provider An object providing features (functions & objects) for remote system.
	 */
	public constructor(provider: Provider = null)
	{
		super(provider);

		// ASSIGN MEMBERS
		this.port_ = null;
		this.state_ = SharedWorkerConnector.State.NONE;
		this.server_is_listening_ = false;

		// HANDLERS
		this.wait_cv_ = new ConditionVariable();
	}

	/**
	 * Connect to remote server.
	 * 
	 * The {@link connect}() method tries to connect an `SharedWorker` instance. If the 
	 * `SharedWorker` instance is not created yet, the `SharedWorker` instance would be newly
	 * created. After the creation, the `SharedWorker` program must open that server using 
	 * the {@link SharedWorkerServer.open}() method.
	 * 
	 * Note that, although the connection has been succeded, it means only server accepted 
	 * your connection request; {@link SharedWorkerAcceptor.accept}(). The acceptance does not 
	 * mean that server is ready to start communication directly. The server would be ready 
	 * when it calls the {@link SharedWorkerAcceptor.listen}() method. If you want to ensure 
	 * the server to be ready, call the {@link wait}() method.
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
	 */
	public connect(jsFile: string): Promise<void>
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
				// SET STATE -> CONNECTING
				this.state_ = SharedWorkerConnector.State.CONNECTING;
				this.server_is_listening_ = false;

				// DO CONNECT
				let worker = new SharedWorker(jsFile);

				this.port_ = worker.port;
				this.port_.onmessage = this._Handle_message.bind(this);
				this.port_.start();

				// GO RETURN
				this.connector_ = new Pair(resolve, reject);
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
		let error: Error = this.inspector();
		if (error)
			throw error;

		//----
		// CLOSE WITH JOIN
		//----
		// PROMISE RETURN
		let ret: Promise<void> = this.join();

		// REQUEST CLOSE TO SERVER
		this.state_ = SharedWorkerConnector.State.CLOSING;
		this.port_.postMessage("CLOSE");

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

	/**
	 * Wait server to be ready.
	 * 
	 * Wait the server to call the {@link SharedWorkerAcceptor.listen}() method.
	 */
	public wait(): Promise<void>;

	/**
	 * Wait server to be ready or timeout.
	 * 
	 * @param ms The maximum milliseconds for waiting.
	 * @return Whether awaken by completion or timeout.
	 */
	public wait(ms: number): Promise<boolean>;

	/**
	 * Wait server to be ready or time expiration.
	 * 
	 * @param at The maximum time point to wait.
	 * @return Whether awaken by completion or time expiration.
	 */
	public wait(at: Date): Promise<boolean>;

	public async wait(param?: number | Date): Promise<void|boolean>
	{
		// TEST CONDITION
		let error: Error = this.inspector();
		if (error)
			throw error;

		//----
		// WAIT SERVER
		//----
		// PREPARE PREDICATOR
		let predicator = () => this.server_is_listening_;

		// SPECIALZE BETWEEN OVERLOADED FUNCTIONS
		if (param === undefined)
			return await this.wait_cv_.wait(predicator);
		else if (param instanceof Date)
			return await this.wait_cv_.wait_until(param, predicator);
		else
			return await this.wait_cv_.wait_for(param, predicator);
	}

	/* ----------------------------------------------------------------
		COMMUNICATOR
	---------------------------------------------------------------- */
	/**
	 * @hidden
	 */
	protected sender(invoke: Invoke): void
	{
		this.port_.postMessage(JSON.stringify(invoke));
	}

	/**
	 * @hidden
	 */
	protected inspector(): Error
	{
		return IConnector.inspect(this.state_);
	}

	/**
	 * @hidden
	 */
	private _Handle_message(evt: MessageEvent): void
	{
		if (evt.data === "ACCEPT")
		{
			this.state_ = SharedWorkerConnector.State.OPEN;
			this.connector_.first();
		}
		else if (evt.data === "PROVIDE")
		{
			this._Handle_provide();
		}
		else if (evt.data === "REJECT")
		{
			this._Handle_reject();
		}
		else if (evt.data === "CLOSE")
		{
			this._Handle_close();
		}
		else
			this.replier(JSON.parse(evt.data));
	}

	/**
	 * @hidden
	 */
	private async _Handle_provide(): Promise<void>
	{
		this.server_is_listening_ = true;
		await this.wait_cv_.notify_all();
	}

	/**
	 * @hidden
	 */
	private async _Handle_reject(): Promise<void>
	{
		this.state_ = SharedWorkerConnector.State.CLOSING;
		this.connector_.second(new RuntimeError("Rejected by server."));

		await this._Handle_close();
	}

	/**
	 * @hidden
	 */
	private async _Handle_close(): Promise<void>
	{
		this.server_is_listening_ = false;
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