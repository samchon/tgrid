import { CommunicatorBase } from "../../base/CommunicatorBase";
import { Invoke } from "../../base/Invoke";

import { is_node } from "tstl/utility/node";

//----
// POLYFILL
//----
/**
 * @hidden
 */
var g: IFeature = is_node()
	? require("./internal/websocket-polyfill")
	: <any>window;

export class WebConnector<Listener extends object = {}>
	extends CommunicatorBase<Listener>
{
	/**
	 * @hidden
	 */
	private socket_: WebSocket;

	/**
	 * @hidden
	 */
	private closer_: ()=>void;

	/* ----------------------------------------------------------------
		CONSTRUCTOR
	---------------------------------------------------------------- */
	public constructor(listener: Listener = null)
	{
		super(listener);
	}
	
	public connect(url: string, protocols?: string | string[]): Promise<void>
	{
		return new Promise((resolve, reject) =>
		{
			// CONSTRUCT SOCKET
			this.socket_ = new g.WebSocket(url, protocols);
			this.socket_.onerror = reject;
			this.socket_.onclose = this._Handle_close.bind(this);

			this.socket_.onopen = () =>
			{
				// RE-DEFINE HANDLERS
				this.socket_.onerror = this._Handle_error.bind(this);
				this.socket_.onmessage = msg =>
				{
					this.replyData(JSON.parse(msg.data));
				};

				// RETURNS
				resolve();
			};
		});
	}

	public close(code?: number, reason?: string): Promise<void>
	{
		return new Promise(resolve =>
		{
			this.closer_ = resolve;
			this.socket_.close(code, reason);
		});
	}

	/* ----------------------------------------------------------------
		ACCESSORS
	---------------------------------------------------------------- */
	public handleClose: (code: number, reason: string) => void;

	public handleError: (error: Error) => void;

	/* ----------------------------------------------------------------
		COMMUNICATOR
	---------------------------------------------------------------- */
	public sendData(invoke: Invoke): void
	{
		this.socket_.send(JSON.stringify(invoke));
	}

	/**
	 * @hidden
	 */
	private _Handle_error(error: Error): void
	{
		if (this.handleError)
			this.handleError(error);
	}

	/**
	 * @hidden
	 */
	private _Handle_close(event: CloseEvent): void
	{
		// DESTRUCT UNRETURNED FUNCTIONS
		this.destructor().then(() =>
		{
			// CLOSD BY SERVER ?
			if (this.closer_)
				this.closer_();
			
			// CUSTOM CLOSE HANDLER
			if (this.handleClose)
				this.handleClose(event.code, event.reason);
		});
	}
}

/**
 * @hidden
 */
interface IFeature
{
	WebSocket: new(url: string, protocols?: string | string[]) => WebSocket;
}