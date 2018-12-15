//================================================================ 
/** @module tgrid.protocols.workers */
//================================================================
import { CommunicatorBase } from "../../basic/CommunicatorBase";
import { IConnector } from "../internal/IConnector";
import { Invoke } from "../../basic/Invoke";

import { LogicError } from "tstl/exception";
import { is_node } from "tstl/utility/node";

//----
// CAPSULIZATION
//----
/**
 * @hidden
 */
const Compiler: CompilerScope = is_node()
	? require("./internal/node-worker")
	: require("./internal/web-worker");

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
	public constructor(provider: Provider = null)
	{
		super(provider);
		
		// ASSIGN MEMBERS
		this.worker_ = null;
		this.connector_ = null;

		this.state_ = WorkerConnector.State.NONE;
	}

	/**
	 * Connec to worker server with compilation.
	 * 
	 * @param content JS Source file to be server with compilation.
	 */
	public async compile(content: string, ...args: string[]): Promise<void>
	{
		if (Compiler.remove)
		{
			let path: string = await Compiler.compile(content);

			await this.connect(path, ...args);
			await Compiler.remove(path);
		}
		else
			await this.connect(<string>Compiler.compile(content), ...args);
	}

	/**
	 * Connect to worker server.
	 * 
	 * @param jsFile JS File to be worker server.
	 * @param args Arguments to deliver.
	 */
	public connect(jsFile: string, ...args: string[]): Promise<void>
	{
		return new Promise((resolve, reject) =>
		{
			//----
			// INSPECTOR
			//----
			if (this.worker_ && this.state !== WorkerConnector.State.CLOSED)
			{
				let err: Error;
				if (this.state_ === WorkerConnector.State.CONNECTING)
					err = new LogicError("On connecting.");
				else if (this.state_ === WorkerConnector.State.OPEN)
					err = new LogicError("Already connected.");
				else
					err = new LogicError("Closing.");

				reject(err);
				return;
			}

			//----
			// CONNECTOR
			//----
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
		// VALIDATION
		if (this.state !== WorkerConnector.State.OPEN)
			throw new LogicError("Not conneced.");

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
		if (this.state_ === WorkerConnector.State.OPEN)
			return null;
		else if (this.state_ === WorkerConnector.State.NONE)
			return new LogicError("Connect first.");
		else if (this.state_ === WorkerConnector.State.CONNECTING)
			return new LogicError("Connecting.");
		else if (this.state_ === WorkerConnector.State.CLOSED)
			return new LogicError("The connection has been closed.");
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
	private _Handle_close(): void
	{
		// STATE & PROMISE RETURN
		this.state_ = WorkerConnector.State.CLOSED;
		this.destructor();
	}
}

export namespace WorkerConnector
{
	export const enum State
	{
		NONE,
		CONNECTING,
		OPEN,
		CLOSING,
		CLOSED
	}
}

/**
 * @hidden
 */
interface CompilerScope
{
	compile(content: string): string | Promise<string>;
	execute(jsFile: string, ...args: string[]): Worker;
	remove?(path: string): Promise<void>;
}