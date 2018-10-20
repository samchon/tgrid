import * as ws from "websocket";

import { CommunicatorBase } from "../../base/CommunicatorBase";
import { Invoke } from "../../base/Invoke";
import { LogicError, RuntimeError } from "tstl/exception";

export class WebAcceptor extends CommunicatorBase
{
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

	/**
	 * @hidden
	 */
	private listening_: boolean;

	/* ----------------------------------------------------------------
		CONSTRUCTORS
	---------------------------------------------------------------- */
	private constructor(request: ws.request)
	{
		super();
		
		this.request_ = request;
	}

	public static _Create(request: any): WebAcceptor
	{
		return new WebAcceptor(request);
	}

	/* ----------------------------------------------------------------
		HANDSHAKES
	---------------------------------------------------------------- */
	public accept(
			protocol?: string, 
			allowOrigin?: string, 
			cookies?: WebAcceptor.ICookie[]
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

	/**
	 * Start listening.
	 * 
	 * Start listening data from the remote client. 
	 * 
	 * @param listener A controller provided for the remote client.
	 */
	public async listen<Listener extends object = {}>
		(listener: Listener): Promise<void>
	{
		this.listener_ = listener;
		if (this.listening_ === true)
			return;
		
		this.listening_ = true;
		this.connection_.on("message", this._Handle_message.bind(this));
		this.connection_.sendUTF("LISTENING");
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
	protected _Is_ready(): Error
	{
		if (!this.connection_)
			return new LogicError("Not accepted.");
		else if (!this.connection_.connected)
			return new RuntimeError("Disconnected.");
		else
			return null;
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

export namespace WebAcceptor
{
	export interface ICookie 
	{
		name: string;
		value: string;
		path?: string;
		domain?: string;
		expires?: Date;
		maxage?: number;
		secure?: boolean;
		httponly?: boolean;
	}
}