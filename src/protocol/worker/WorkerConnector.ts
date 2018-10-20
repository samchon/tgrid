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
var g: IWorker = is_node()
	? require("./internal/worker-connector-polyfill")
	: <any>window;

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
	private connector_: ()=>void;

	/**
	 * @hidden
	 */
	private closer_: ()=>void;

	/**
	 * @hidden
	 */
	private state_: WorkerConnector.State;

	/* ----------------------------------------------------------------
		CONSTRUCTOR
	---------------------------------------------------------------- */
	public constructor(listener?: Listener)
	{
		super(listener);
		this.state_ = WorkerConnector.State.NONE;
	}

	public connect(jsFile: string, waitFor: number = null): Promise<void>
	{
		return new Promise((resolve, reject) =>
		{
			try
			{
				// SET STATE -> CONNECTING
				this.state_ = WorkerConnector.State.CONNECTING;

				// DO CONNECT
				this.worker_ = new g.Worker(jsFile);
				this.worker_.onmessage = this._Reply_data.bind(this);

				// GO RETURN
				this.connector_ = resolve;
				this.worker_.postMessage("READY");
			}
			catch (exp)
			{
				this.state_ = WorkerConnector.State.NONE;
				reject(exp);

				return;
			}

			if (waitFor !== null)
				setTimeout(() =>
				{
					this.state_ = WorkerConnector.State.NONE;
					reject();
				}, waitFor);
		});
	}

	public close(): Promise<void>
	{
		return new Promise(resolve =>
		{
			this.closer_ = resolve;
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
	private _Reply_data(evt: MessageEvent): void
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
				this.worker_.terminate();
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