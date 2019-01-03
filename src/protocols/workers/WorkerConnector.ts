//================================================================ 
/** @module tgrid.protocols.workers */
//================================================================
import { CommunicatorBase } from "../../basic/CommunicatorBase";
import { IConnector } from "../internal/IConnector";
import { Invoke } from "../../basic/Invoke";

import { DomainError } from "tstl/exception";
import { is_node } from "tstl/utility/node";

/**
 * Worker Connector.
 * 
 * The `WorkerConnector` is a communicator class, who can create `Worker` and interact 
 * with the `Worker` using RFC (Remote Function Call), considering the `Worker` as a 
 * remote system (@link WorkerServer).
 * 
 * > `Worker` is designed to support thread in browser, however, the `Worker` cannot share
 * > memory variable at all. The only way to interact with `Worker` and its parent is 
 * > using communication channel with inter-promised message (IPC).
 * >
 * > It seems like network communication, right? That's the reason why TGrid considers 
 * > `Worker` as a remote system and supports RFC (Remote Function Call) in such worker
 * > environments.
 * 
 * Note that, after the connection and interaction, don't forget terminating the worker
 * using {@link close close()} (or {@link WorkeerServer.close WorkerServer.close()}). If 
 * you don't terminate it, then vulnerable memory and communication channel leak would be 
 * happened.
 * 
 * @see {@link WorkerServer}
 * @author Jeongho Nam <http://samchon.org>
 */
export class WorkerConnector<Provider extends object = {}>
	extends CommunicatorBase<Provider>
	implements Pick<IConnector<WorkerConnector.State>, "state">
{
	/**
	 * @hidden
	 */
	private worker_: Worker;

	/**
	 * @hidden
	 */
	private connector_: ()=>void;

	/**
	 * @hidden
	 */
	private state_: WorkerConnector.State;

	/* ----------------------------------------------------------------
		CONSTRUCTOR
	---------------------------------------------------------------- */
	/**
	 * Initializer Constructor.
	 * 
	 * @param provider A provider for server.
	 */
	public constructor(provider: Provider = null)
	{
		super(provider);
		
		// ASSIGN MEMBERS
		this.worker_ = null;
		this.connector_ = null;

		this.state_ = WorkerConnector.State.NONE;
	}

	/**
	 * Connect to worker server with compilation.
	 * 
	 * @param content JS Source file to be server with compilation.
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
		let error: Error = null; // FOR LAZY-THROWING

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
		if (error)
			throw error;
	}

	/**
	 * Connect to worker server.
	 * 
	 * @param jsFile JS File to be worker server.
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
				this.worker_.postMessage("READY");
			}
			catch (exp)
			{
				this.state_ = WorkerConnector.State.NONE;
				reject(exp);
			}
		});
	}

	/**
	 * Close connection.
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
		this.state_ = WorkerConnector.State.CLOSING;
		this.worker_.postMessage("CLOSE");

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
	protected sender(invoke: Invoke): void
	{
		this.worker_.postMessage(JSON.stringify(invoke));
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
		if (evt.data === "READY")
		{
			this.state_ = WorkerConnector.State.OPEN;
			this.connector_();
		}
		else if (evt.data === "CLOSE")
			this._Handle_close();
		else
			this.replier(JSON.parse(evt.data));
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