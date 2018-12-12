//================================================================ 
/** @module tgrid.protocols.workers */
//================================================================
import { CommunicatorBase } from "../../basic/CommunicatorBase";
import { Invoke } from "../../basic/Invoke";

import { is_node } from "tstl/utility/node";
import { URLVariables } from "../../utils/URLVariables";

//----
// CAPSULIZATION
//----
/**
 * @hidden
 */
var g: IFeature = is_node()
	? require("./internal/worker-server-polyfill")
	: self;

export class WorkerServer 
	extends CommunicatorBase
{
	private args_: string[];

	/* ----------------------------------------------------------------
		CONSTRUCTOR
	---------------------------------------------------------------- */
	/**
	 * Default Constructor.
	 */
	public constructor()
	{
		super();
	}

	/**
	 * Open server.
	 */
	public async open<Provider extends object>(provider: Provider): Promise<void>
	{
		this.provider_ = provider;
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
		ACCESSORS
	---------------------------------------------------------------- */
	/**
	 * Arguments delivered from the connector.
	 */
	public get arguments(): string[]
	{
		if (this.args_ === undefined)
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