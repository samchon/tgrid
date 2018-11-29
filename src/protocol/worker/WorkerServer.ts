//================================================================ 
/** @module tgrid.protocol.worker */
//================================================================
import { CommunicatorBase } from "../../base/CommunicatorBase";
import { Invoke } from "../../base/Invoke";

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
{
	/* ----------------------------------------------------------------
		CONSTRUCTOR
	---------------------------------------------------------------- */
	public constructor(provider: Provider = null)
	{
		super(provider);

		g.onmessage = this._Handle_message.bind(this);
	}

	/**
	 * Close server.
	 */
	public async close(): Promise<void>
	{
		// HANDLERS
		await this.destructor();
		
		// DO CLOSE
		g.postMessage("CLOSE");
		g.close();
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
		return null;
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

/**
 * @hidden
 */
interface IFeature
{
	close(): void;
	postMessage(message: any): void;
	onmessage(event: MessageEvent): void;
}