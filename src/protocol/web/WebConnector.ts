import "websocket-polyfill";

import { CommunicatorBase } from "../../base/CommunicatorBase";
import { Invoke } from "../../base/Invoke";


export class WebConnector<Listener extends object = {}>
	extends CommunicatorBase<Listener>
{
	/**
	 * @hidden
	 */
	private socket_: WebSocket;

	/* ----------------------------------------------------------------
		CONSTRUCTOR
	---------------------------------------------------------------- */
	public constructor(listener: Listener = null)
	{
		super(listener);
	}
	
	/* ----------------------------------------------------------------
		SOCKET
	---------------------------------------------------------------- */
	public connect(url: string, protocols?: string | string[]): Promise<void>
	{
		return new Promise((resolve, reject) =>
		{
			this.socket_ = new WebSocket(url, protocols);
			this.socket_.onopen = <any>resolve;
			this.socket_.onerror = reject;
			this.socket_.onclose = this.destroy.bind(this);

			this.socket_.onmessage = msg =>
			{
				this.replyData(JSON.parse(msg.data));
			};
		});
	}

	public close(code?: number, reason?: string): void
	{
		this.socket_.close(code, reason);
	}

	/* ----------------------------------------------------------------
		COMMUNICATOR
	---------------------------------------------------------------- */
	public sendData(invoke: Invoke): void
	{
		this.socket_.send(JSON.stringify(invoke));
	}
}