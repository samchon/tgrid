import { CommunicatorBase } from "../../base/CommunicatorBase";
import { Invoke } from "../../base/Invoke";

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

	/* ----------------------------------------------------------------
		CONSTRUCTOR
	---------------------------------------------------------------- */
	public constructor(listener?: Listener)
	{
		super(listener);
	}

	public connect(jsFile: string, waitFor: number = null): Promise<void>
	{
		return new Promise((resolve, reject) =>
		{
			try
			{
				this.worker_ = new g.Worker(jsFile);
				this.worker_.onmessage = this._Reply_data.bind(this);

				this.connector_ = resolve;
				this.worker_.postMessage("READY");
			}
			catch (exp)
			{
				reject(exp);
				return;
			}

			if (waitFor !== null)
				setTimeout(() =>
				{
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
	private _Reply_data(evt: MessageEvent): void
	{
		if (evt.data === "READY")
			this.connector_();
		else if (evt.data === "CLOSE")
		{
			this.closer_();
			this.worker_.terminate();
		}
		else
			this.replyData(JSON.parse(evt.data));
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