import * as ws from "websocket";

import { WebServer } from "./WebServer";
import { CommunicatorBase } from "../../base/CommunicatorBase";
import { Invoke } from "../../base/Invoke";

export class WebAcceptor extends CommunicatorBase
{
	/**
	 * @hidden
	 */
	private server_: WebServer;

	/**
	 * @hidden
	 */
	private request_: ws.request;

	/**
	 * @hidden
	 */
	private connection_: ws.connection;

	/**
	 * @hidden
	 */
	private closer_: ()=>void;

	/* ----------------------------------------------------------------
		CONSTRUCTORS
	---------------------------------------------------------------- */
	public constructor(server: WebServer, request: ws.request)
	{
		super();

		this.server_ = server;
		this.request_ = request;
	}

	public accept(
			protocol?: string, 
			allowOrigin?: string, 
			cookies?: ws.ICookie[]
		): Promise<boolean>
	{
		return new Promise((resolve, reject) =>
		{
			// PREPARE EVENT LISTENERS
			this.request_.on("requestAccepted", connection =>
			{
				this.connection_ = connection;
				this.connection_.on("error", this._Handle_error.bind(this));
				this.connection_.on("close", this._Handle_close.bind(this));

				resolve();
			});
			this.request_.on("requestRejected", (error?: Error) =>
			{
				reject(error);
			});

			// DO ACCEPT
			this.request_.accept(protocol, allowOrigin, cookies);
		});
	}

	public async listen<Listener extends object = {}>
		(listener: Listener): Promise<void>
	{
		this.listener_ = listener;
		this.connection_.on("message", this._Handle_message.bind(this));
	}
	
	public close(): Promise<void>
	{
		return new Promise((resolve) =>
		{
			this.closer_ = resolve;
			this.connection_.close();
		});
	}

	/* ----------------------------------------------------------------
		ACCESSORS
	---------------------------------------------------------------- */
	public getServer(): WebServer
	{
		return this.server_;
	}

	public getPath(): string
	{
		return this.request_.resource;
	}

	public handleClose: (code: number, reason: string)=>void;
	public handleError: (error: Error)=>void;

	/* ----------------------------------------------------------------
		COMMUNICATOR
	---------------------------------------------------------------- */
	public sendData(invoke: Invoke): void
	{
		this.connection_.sendUTF(JSON.stringify(invoke));
	}

	/**
	 * @hidden
	 */
	private _Handle_message(message: ws.IMessage): void
	{
		let invoke: Invoke = JSON.parse(message.utf8Data);
		this.replyData(invoke);
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
	private _Handle_close(code: number, reason: string): void
	{
		// DESTRUCT UNRETURNED FUNCTIONS
		this.destructor().then(() =>
		{
			// CLOSD BY SERVER ?
			if (this.closer_)
				this.closer_();
			
			// CUSTOM CLOSE HANDLER
			if (this.handleClose)
				this.handleClose(code, reason);
		});
	}
}