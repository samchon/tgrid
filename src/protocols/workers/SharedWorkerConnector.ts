//================================================================ 
/** @module tgrid.protocols.workers */
//================================================================
import { CommunicatorBase } from "../../basic/CommunicatorBase";
import { IConnector } from "../internal/IConnector";
import { Invoke } from "../../basic/Invoke";

import { ConditionVariable } from "tstl/thread/ConditionVariable";
import { LogicError, RuntimeError } from "tstl/exception";
import { Pair } from "tstl/utility/Pair";

import { compile as _Compile } from "./internal/web-compiler";

export class SharedWorkerConnector<Provider extends Object = {}>
	extends CommunicatorBase<Provider>
	implements IConnector<SharedWorkerConnector.State>
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
	private cv_: ConditionVariable;

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
	public constructor(provider: Provider = null)
	{
		super(provider);

		// ASSIGN MEMBERS
		this.port_ = null;
		this.state_ = SharedWorkerConnector.State.NONE;
		this.server_is_listening_ = false;

		// HANDLERS
		this.cv_ = new ConditionVariable();
	}

	public connect(jsFile: string): Promise<void>
	{
		return new Promise((resolve, reject) => 
		{
			try
			{
				// SET STATE -> CONNECTING
				this.state_ = SharedWorkerConnector.State.CONNECTING;

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
	 * Close connection.
	 */
	public async close(): Promise<void>
	{
		// VALIDATION
		if (this.state !== SharedWorkerConnector.State.OPEN)
			throw new LogicError("Not conneced.");

		//----
		// CLOSE WITH JOIN
		//----
		// REQUEST CLOSE TO SERVER
		let ret: Promise<void> = this.join();
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
	 * @inheritDoc
	 */
	public wait(): Promise<void>;

	/**
	 * @inheritDoc
	 */
	public wait(ms: number): Promise<boolean>;

	/**
	 * @inheritDoc
	 */
	public wait(at: Date): Promise<boolean>;

	public async wait(param: number | Date = null): Promise<void|boolean>
	{
		if (this.server_is_listening_ === true)
			return true;

		if (param === null)
			return await this.cv_.wait();
		else if (param instanceof Date)
			return await this.cv_.wait_until(param);
		else
			return await this.cv_.wait_for(param as number);
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
		return null;
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
		else if (evt.data === "REJECT")
		{
			this.state_ = SharedWorkerConnector.State.CLOSED;
			this.connector_.second(new RuntimeError("Denied by server."));
		}
		else if (evt.data === "PROVIDE")
		{
			this.server_is_listening_ = true;
			this.cv_.notify_all();
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
	private _Handle_close(): void
	{
		// STATE & PROMISE RETURN
		this.state_ = SharedWorkerConnector.State.CLOSED;
		this.destructor();
	}
}

export namespace SharedWorkerConnector
{
	export const enum State
	{
		NONE,
		CONNECTING,
		OPEN,
		CLOSING,
		CLOSED,
		DENIED
	}
	
	export function compile(content: string): string
	{
		return _Compile(content);
	}
}