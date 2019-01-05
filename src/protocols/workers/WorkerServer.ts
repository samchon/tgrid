//================================================================ 
/** @module tgrid.protocols.workers */
//================================================================
import { CommunicatorBase } from "../../basic/CommunicatorBase";
import { IWorkerSystem } from "./internal/IWorkerSystem";
import { Invoke } from "../../basic/Invoke";

import { is_node } from "tstl/utility/node";
import { URLVariables } from "../../utils/URLVariables";
import { DomainError, RuntimeError } from "tstl/exception";

/**
 * Worker Server.
 * 
 * The `WorkerServer` is a class representing a `Worker` server who can communicate with 
 * remote client, parent and creator of the `Worker` (anyway {@link WorkerConnector}), using 
 * RFC (Remote Function Call).
 * 
 * Unlike other servers, `WorkerServer` can accept only a client ({@link WorkerConnector})
 * because the worker is dependent on its parent instance (web page, node or parent worker).
 * Thus, `WorkerServer` does not have any acceptor and communicates with client (its parent)
 * by itself.
 * 
 * To start communication with the remote client, call the {@link open}() method with special
 * `Provider`. After your business, don't forget terminating this worker using {@link close}() 
 * or {@link WorkerConnector.close}() method. If you don't terminate it, then vulnerable 
 * memory and communication channel would be kept and it may cause the memory leak.
 * 
 * > #### Why workers be network systems?
 * > `Worker` is designed to support thread in JavaScript. However, the `Worker` cannot share 
 * > memory variable at all. The only way to interact with `Worker` and its parent is using 
 * > the `MessagePort` with inter-promised message (IPC, inter-process communication).
 * > 
 * >  - *Worker*, it's a type of *thread* in physical level.
 * >  - *Worker*, it's a type of *process* in logical level.
 * >  - **Worker**, it's same with **network system** in conceptual level.
 * > 
 * > It seems like network communication, isn't it? That's the reason why TGrid considers 
 * > `Worker` as a remote system and supports RFC (Remote Function Call) in such worker 
 * > environments.
 * 
 * @wiki https://github.com/samchon/tgrid/wiki/Workers
 * @author Jeongho Nam <http://samchon.org>
 */
export class WorkerServer<Provider extends object = {}>
	extends CommunicatorBase<Provider>
	implements IWorkerSystem
{
	/**
	 * @hidden
	 */
	private args_: string[];

	/**
	 * @hidden
	 */
	private state_: WorkerServer.State;

	/* ----------------------------------------------------------------
		CONSTRUCTOR
	---------------------------------------------------------------- */
	/**
	 * Default Constructor.
	 */
	public constructor()
	{
		super();

		this.args_ = null;
		this.state_ = WorkerServer.State.NONE;
	}

	/**
	 * Open server with `Provider`.
	 * 
	 * Open worker server and start communication with the remote system 
	 * ({@link WorkerConnector}). 
	 * 
	 * Note that, after your business, you should terminate this worker to prevent waste 
	 * of memory leak. Close this worker by yourself ({@link close}) or let remote client to 
	 * close this worker ({@link WorkerConnector.close}).
	 * 
	 * @param provider An object providing featrues for the remote system.
	 */
	public async open(provider: Provider = null): Promise<void>
	{
		// TEST CONDITION
		if (is_node() === false)
		{
			if (self.document !== undefined)
				throw new DomainError("This is not Worker.");	
		}
		else if (global.process.send === undefined)
			throw new DomainError("This is not Child Process.");	
		else if (this.state_ !== WorkerServer.State.NONE)
			throw new DomainError("Server has opened yet.");
		
		// OPEN WORKER
		this.state_ = WorkerServer.State.OPENING;
		{
			this.provider_ = provider;
			g.onmessage = this._Handle_message.bind(this);
		}
		this.state_ = WorkerServer.State.OPEN;
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
		// CLOSE WORKER
		//----
		this.state_ = WorkerServer.State.CLOSING;
		{
			// HANDLERS
			g.postMessage("CLOSE");
			await this.destructor();
			
			// DO CLOSE
			g.close();
		}
		this.state_ = WorkerServer.State.CLOSED;
	}

	/* ----------------------------------------------------------------
		ACCESSORS
	---------------------------------------------------------------- */
	/**
	 * Arguments delivered from the connector.
	 */
	public get arguments(): string[]
	{
		if (this.args_ === null)
			if (is_node())
				this.args_ = global.process.argv.slice(2);
			else
			{
				let vars: URLVariables = new URLVariables(self.location.href);
				this.args_ = vars.has("__m_pArgs")
					? JSON.parse(vars.get("__m_pArgs"))
					: [];
			}
		return this.args_;
	}

	/**
	 * @inheritDoc
	 */
	public get state(): WorkerServer.State
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
		g.postMessage(JSON.stringify(invoke));
	}

	/**
	 * @hidden
	 */
	protected inspector(): Error
	{
		// NO ERROR
		if (this.state_ === WorkerServer.State.OPEN)
			return null;

		// ERROR, ONE OF THEM
		else if (this.state_ === WorkerServer.State.NONE)
			return new DomainError("Server is not opened yet.");
		else if (this.state_ === WorkerServer.State.OPENING)
			return new DomainError("Server is on opening; wait for a sec.");
		else if (this.state_ === WorkerServer.State.CLOSING)
			return new RuntimeError("Server is on closing.");

		// MAY NOT BE OCCURED
		else if (this.state_ === WorkerServer.State.CLOSED)
			return new RuntimeError("The server has been closed.");
		else
			return new RuntimeError("Unknown error, but not connected.");
	}

	/**
	 * @hidden
	 */
	private _Handle_message(evt: MessageEvent): void
	{
		if (evt.data === "READY")
			g.postMessage("READY");
		else if (evt.data === "CLOSE")
			this.close();
		else
			this.replier(JSON.parse(evt.data));
	}
}

export namespace WorkerServer
{
	export const enum State
	{
		NONE = -1,
		OPENING = 0,
		OPEN = 1,
		CLOSING = 2,
		CLOSED = 3
	}
}

//----
// POLYFILL
//----
/**
 * @hidden
 */
const g: IFeature = is_node()
	? require("./internal/worker-server-polyfill")
	: self;

/**
 * @hidden
 */
interface IFeature
{
	close(): void;
	postMessage(message: any): void;
	onmessage(event: MessageEvent): void;
}