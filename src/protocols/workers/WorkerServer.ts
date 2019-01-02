//================================================================ 
/** @module tgrid.protocols.workers */
//================================================================
import { CommunicatorBase } from "../../basic/CommunicatorBase";
import { IState } from "../internal/IState";
import { Invoke } from "../../basic/Invoke";

import { is_node } from "tstl/utility/node";
import { URLVariables } from "../../utils/URLVariables";
import { DomainError, RuntimeError } from "tstl/exception";

export class WorkerServer 
	extends CommunicatorBase
	implements IState<WorkerServer.State>
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
	 * Open server.
	 * 
	 * @param provider A provider for the remote client.
	 */
	public async open<Provider extends object>(provider: Provider = null): Promise<void>
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
	 * Close server.
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