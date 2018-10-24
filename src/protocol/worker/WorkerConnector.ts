import { CommunicatorBase } from "../../base/CommunicatorBase";
import { Invoke } from "../../base/Invoke";

import { DomainError } from "tstl/exception";
import { is_node } from "tstl/utility/node";

//----
// CAPSULIZATION
//----
/**
 * @hidden
 */
const g: IWorker = is_node()
	? require("./internal/worker-connector-polyfill")
	: <any>window;

/**
 * @hidden
 */
const Compiler: CompilerScope = is_node()
	? require("./internal/node-compiler")
	: require("./internal/web-compiler");

export class WorkerConnector<Listener extends object = {}>
	extends CommunicatorBase<Listener>
{
	/**
	 * @hidden
	 */
	private worker_: Worker;

	/**
	 * @hidden
	 */
	private state_: WorkerConnector.State;

	/**
	 * @hidden
	 */
	private connector_: ()=>void;

	/**
	 * @hidden
	 */
	private closer_: ()=>void;

	/* ----------------------------------------------------------------
		CONSTRUCTOR
	---------------------------------------------------------------- */
	public constructor(listener: Listener = null)
	{
		super(listener);

		this.worker_ = null;
		this.state_ = WorkerConnector.State.NONE;
	}

	public async compile(content: string): Promise<void>
	{
		if (Compiler.remove)
		{
			let path: string = await Compiler.compile(content);

			await this.connect(path);
			await Compiler.remove(path);
		}
		else
			this.connect(Compiler.compile(content) as string);
	}

	public connect(jsFile: string): Promise<void>
	{
		return new Promise((resolve, reject) =>
		{
			try
			{
				// SET STATE -> CONNECTING
				this.state_ = WorkerConnector.State.CONNECTING;

				// DO CONNECT
				this.worker_ = new g.Worker(jsFile);
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

	public close(): Promise<void>
	{
		// 1. REQUEST CLOSE TO SERVER
		// 2. DO CLOSE IN SERVER
		// 3. RESOLVE
		return new Promise(resolve =>
		{
			this.closer_ = resolve;
			this.state_ = WorkerConnector.State.CLOSING;

			this.worker_.postMessage("CLOSE");
		});
	}
	
	/* ----------------------------------------------------------------
		COMMUNICATOR
	---------------------------------------------------------------- */
	public sendData(invoke: Invoke): void
	{
		this.worker_.postMessage(JSON.stringify(invoke));
	}

	/**
	 * @hidden
	 */
	protected _Is_ready(): Error
	{
		if (this.state_ === WorkerConnector.State.OPEN)
			return null;
		else if (this.state_ === WorkerConnector.State.NONE)
			return new DomainError("Connect first.");
		else if (this.state_ === WorkerConnector.State.CONNECTING)
			return new DomainError("Connecting.");
		else if (this.state_ === WorkerConnector.State.CLOSED)
			return new DomainError("The connection has been closed.");
	}

	/**
	 * @hidden
	 */
	protected _Handle_message(evt: MessageEvent): void
	{
		if (evt.data === "READY")
		{
			this.state_ = WorkerConnector.State.OPEN;
			this.connector_();
		}
		else if (evt.data === "CLOSE")
		{
			this.state_ = WorkerConnector.State.CLOSED;
			this.destructor().then(() =>
			{
				this.closer_();
			});
		}
		else
			this.replyData(JSON.parse(evt.data));
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
interface IWorker
{
	Worker: 
	{
		new(jsFile: string): Worker;
	};
}

/**
 * @hidden
 */
interface CompilerScope
{
	compile(content: string): string | Promise<string>;
	remove?(path: string): Promise<void>;
}