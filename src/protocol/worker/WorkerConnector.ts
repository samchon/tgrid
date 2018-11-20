import { CommunicatorBase } from "../../base/CommunicatorBase";
import { IConnector } from "../internal/IConnector";
import { Invoke } from "../../base/Invoke";

import { DomainError } from "tstl/exception";
import { is_node } from "tstl/utility/node";

//----
// CAPSULIZATION
//----
/**
 * @hidden
 */
var g: IWorker = is_node()
	? require("./internal/worker-connector-polyfill")
	: self;

/**
 * @hidden
 */
const Compiler: CompilerScope = is_node()
	? require("./internal/node-compiler")
	: require("./internal/web-compiler");

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
	private closers_: Array<()=>void>;

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
		this.closers_ = [];
		this.state_ = WorkerConnector.State.NONE;
	}

	/**
	 * Connec to worker server with compilation.
	 * 
	 * @param content JS Source file to be server with compilation.
	 */
	public async compile(content: string): Promise<void>
	{
		if (Compiler.remove)
		{
			let path: string = await Compiler.compile(content);

			await this.connect(path);
			await Compiler.remove(path);
		}
		else
			await this.connect(Compiler.compile(content) as string);
	}

	/**
	 * Connect to worker server.
	 * 
	 * @param jsFile JS File to be worker server.
	 */
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

	/**
	 * Close worker connection.
	 */
	public close(): Promise<void>
	{
		// 1. REQUEST CLOSE TO SERVER
		// 2. DO CLOSE IN SERVER
		// 3. RESOLVE
		return new Promise(resolve =>
		{
			this.closers_.push(resolve);
			this.state_ = WorkerConnector.State.CLOSING;

			this.worker_.postMessage("CLOSE");
		});
	}

	/**
	 * @hidden
	 */
	protected readonly destructor: ()=>Promise<void>;

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

	/**
	 * Join worker.
	 */
	public join(): Promise<void>
	{
		return new Promise(resolve =>
		{
			this.closers_.push(resolve);
		});
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
	protected readonly replier: (invoke: Invoke)=>void;

	/**
	 * @hidden
	 */
	protected inspector(): Error
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
		this.destructor().then(() =>
		{
			// CLOSE OR JOIN(s)
			for (let closer of this.closers_)
				closer();
			
			// CLEAR CLOSERS
			this.closers_ = [];
		});
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