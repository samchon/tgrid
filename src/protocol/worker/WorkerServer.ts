import { CommunicatorBase } from "../../base/CommunicatorBase";
import { ICommunicator } from "../internal/ICommunicator";
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
	: self;

export class WorkerServer<Provider extends object = {}> 
	extends CommunicatorBase<Provider>
	implements ICommunicator
{
	/**
	 * @hidden
	 */
	private ready_: boolean;

	/**
	 * @inheritdoc
	 */
	public handleClose: ()=>void;

	/* ----------------------------------------------------------------
		CONSTRUCTOR
	---------------------------------------------------------------- */
	public constructor(provider: Provider = null)
	{
		super(provider);

		this.ready_ = false;
		this.handleClose = null;

		g.onmessage = this._Handle_message.bind(this);
	}

	/**
	 * Close server.
	 */
	public async close(): Promise<void>
	{
		// HANDLERS
		await this.destructor();
		if (this.handleClose)
			this.handleClose();
		
		// DO CLOSE
		g.postMessage("CLOSE");
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