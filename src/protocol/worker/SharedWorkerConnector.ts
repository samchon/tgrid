import { CommunicatorBase } from "../../base/CommunicatorBase";
import { Invoke } from "../../base/Invoke";

import { ConditionVariable } from "tstl/thread/ConditionVariable";
import { RuntimeError } from "tstl/exception";
import { Pair } from "tstl/utility/Pair";
import { compile } from "./internal/node-compiler";

export class SharedWorkerConnector<Listener extends Object = {}>
	extends CommunicatorBase<Listener>
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

	/**
	 * @hidden
	 */
	private closer_: ()=>void;

	/* ----------------------------------------------------------------
		CONSTRUCTOR
	---------------------------------------------------------------- */
	public constructor(listener: Listener = null)
	{
		// ASSIGN MEMBERS
		super(listener);
		this.port_ = null;
		this.state_ = SharedWorkerConnector.State.NONE;

		// PROMISES
		this.cv_ = new ConditionVariable();
		this.server_is_listening_ = false;
	}

	public compile(content: string): Promise<void>
	{
		return this.connect(compile(content));
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

	public close(): Promise<void>
	{
		// 1. REQUEST CLOSE TO SERVER
		// 2. DO CLOSE IN SERVER
		// 3. RESOLVE
		return new Promise((resolve, reject) =>
		{
			this.closer_ = resolve;
			this.port_.postMessage("CLOSE");
		});
	}

	/* ----------------------------------------------------------------
		ACCESSORS
	---------------------------------------------------------------- */
	public get state(): SharedWorkerConnector.State
	{
		return this.state_;
	}

	public wait(): Promise<void>;
	public wait(ms: number): Promise<boolean>;
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
	public sendData(invoke: Invoke): void
	{
		this.port_.postMessage(JSON.stringify(invoke));
	}

	/**
	 * @hidden
	 */
	protected _Is_ready(): Error
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
		else if (evt.data === "DENY")
		{
			this.state_ = SharedWorkerConnector.State.CLOSED;
			this.connector_.second(new RuntimeError("Denied by server."));
		}
		else if (evt.data === "LISTENING")
		{
			this.server_is_listening_ = true;
			this.cv_.notify_all();
		}
		else if (evt.data === "CLOSE")
		{
			this.state_ = SharedWorkerConnector.State.CLOSED;
			this.destructor().then(() =>
			{
				this.closer_();
			});
		}
		else
			this.replyData(JSON.parse(evt.data));
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
}