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
var g: IFeature = is_node()
	? require("./internal/worker-server-polyfill")
	: <any>window;

export class WorkerServer<Provider extends object = {}> 
	extends CommunicatorBase<Provider>
{
	/**
	 * @hidden
	 */
	private ready_: boolean;

	/* ----------------------------------------------------------------
		CONSTRUCTOR
	---------------------------------------------------------------- */
	public constructor(provider: Provider = null)
	{
		super(provider);

		this.ready_ = false;
		g.onmessage = this._Handle_message.bind(this);
	}

	public async close(): Promise<void>
	{
		// DESTRUCT & INFORM TO CLIENT
		await this.destructor();
		g.postMessage("CLOSE");

		// DO CLOSE
		g.close();
	}

	/* ----------------------------------------------------------------
		COMMUNICATOR
	---------------------------------------------------------------- */
	/**
	 * @inheritDoc
	 */
	public sendData(invoke: Invoke): void
	{
		g.postMessage(JSON.stringify(invoke));
	}

	/**
	 * @hidden
	 */
	protected _Is_ready(): Error
	{
		return this.ready_
			? null
			: new DomainError("Not ready yet.");
	}

	/**
	 * @hidden
	 */
	private _Handle_message(evt: MessageEvent): void
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