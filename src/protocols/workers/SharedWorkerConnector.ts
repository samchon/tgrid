//================================================================ 
/** @module tgrid.protocols.workers */
//================================================================
import { CommunicatorBase } from "../../basic/CommunicatorBase";
import { IConnector } from "../internal/IConnector";
import { Invoke } from "../../basic/Invoke";

import { ConditionVariable } from "tstl/thread/ConditionVariable";
import { DomainError, RuntimeError } from "tstl/exception";
import { Pair } from "tstl/utility/Pair";

import { compile as _Compile } from "./internal/web-worker";

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
	
	export function compile(content: string): string
	{
		return _Compile(content);
	}
}