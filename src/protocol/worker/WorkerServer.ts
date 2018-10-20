import { CommunicatorBase } from "../../base/CommunicatorBase";
import { Invoke } from "../../base/Invoke";

import { is_node } from "tstl/utility/node";
import { DomainError } from "tstl/exception";

//----
// CAPSULIZATION
//----
/**
 * @hidden
 */
var g: IFeature = is_node()
	? require("./internal/worker-server-polyfill")
	: <any>window;

export class WorkerServer<Listener extends object = {}> 
	extends CommunicatorBase<Listener>
{
	private ready_: boolean;

	/* ----------------------------------------------------------------
		CONSTRUCTOR
	---------------------------------------------------------------- */
	public constructor(listener: Listener = null)
	{
		super(listener);

		this.ready_ = false;
		g.onmessage = this._Reply_data.bind(this);
	}

	public async close(): Promise<void>
	{
		await this.destructor();
		g.postMessage("CLOSE");

		close();
	}

	/* ----------------------------------------------------------------
		COMMUNICATOR
	---------------------------------------------------------------- */
	public sendData(invoke: Invoke): void
	{
		g.postMessage(JSON.stringify(invoke));
	}

	protected _Is_ready(): Error
	{
		return this.ready_
			? null
			: new DomainError("Not ready yet.");
	}

	/**
	 * @hidden
	 */
	private _Reply_data(evt: MessageEvent): void
	{
		if (evt.data === "READY")
		{
			g.postMessage("READY");
			this.ready_ = true;
		}
		else if (evt.data === "CLOSE")
		{
			this.close();
		}
		else
			this.replyData(JSON.parse(evt.data));
	}
}

/**
 * @hidden
 */
interface IFeature
{
	close(): void;
	postMessage(message: any): void;
	onmessage(event: MessageEvent): void;
}