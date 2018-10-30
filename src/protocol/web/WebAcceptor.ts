import * as ws from "websocket";

import { CommunicatorBase } from "../../base/CommunicatorBase";
import { IWebCommunicator } from "./internal/IWebCommunicator";
import { Invoke } from "../../base/Invoke";

import { LogicError, RuntimeError } from "tstl/exception";

export class WebAcceptor extends CommunicatorBase implements IWebCommunicator
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
	/**
	 * @hidden
	 */
	private constructor(request: ws.request)
	{
		super();
		
		this.request_ = request;
	}

	public close(): Promise<void>
	{
		return new Promise((resolve) =>
		{
			this.closer_ = resolve;
			if (this.connection_)
				this.connection_.close();
		});
	}

	/* ----------------------------------------------------------------
		HANDSHAKES
	---------------------------------------------------------------- */
	/**
	 * Accept connection.
	 * 
	 * @param protocol 
	 * @param allowOrigin 
	 * @param cookies 
	 */
	public accept(
			protocol?: string, 
			allowOrigin?: string, 
			cookies?: WebAcceptor.ICookie[]
		): Promise<void>
	{
		return new Promise((resolve, reject) =>
		{
			// PREPARE EVENT LISTENERS
			this.request_.on("requestAccepted", connection =>
			{
				this.connection_ = connection;
				this.connection_.on("error", this._Handle_error.bind(this));
				this.connection_.on("close", this._Handle_close.bind(this));
				this.connection_.on("message", this._Handle_message.bind(this));

				resolve();
			});

			// DO ACCEPT
			try
			{
				this.request_.accept(protocol, allowOrigin, cookies);
			}
			catch (exp)
			{
				reject(exp);
			}
		});
	}

	/**
	 * Reject connection.
	 * 
	 * @param status Status code.
	 * @param reason Detailed reason to reject.
	 * @param extraHeaders Extra headers if required.
	 */
	public reject(status?: number, reason?: string, extraHeaders?: object): Promise<void>
	{
		return new Promise(resolve =>
		{
			this.request_.on("requestRejected", resolve);
			this.request_.reject(status, reason, extraHeaders);
		});
	}

	/**
	 * Start listening.
	 * 
	 * Start listening data from the remote client. 
	 * 
	 * @param provider A provider for the remote client.
	 */
	public async listen<Provider extends object = {}>
		(provider: Provider): Promise<void>
	{
		this.provider_ = provider;
		if (this.listening_ === true)
			return;
		
		this.listening_ = true;
		this.connection_.sendUTF("PROVIDE");
	}

	/* ----------------------------------------------------------------
		ACCESSORS
	---------------------------------------------------------------- */
	public get path(): string
	{
		return this.request_.resource;
	}

	public get protocol(): string
	{
		return this.connection_.protocol;
	}

	public get extensions(): string
	{
		return this.connection_
			.extensions
			.map(elem => elem.name)
			.toString();
	}

	/**
	 * @inheritDoc
	 */
	public handleClose: (code: number, reason: string) => void;

	/**
	 * @inheritDoc
	 */
	public handleError: (error: Error)=>void;

	/* ----------------------------------------------------------------
		COMMUNICATOR
	---------------------------------------------------------------- */
	/**
	 * @inheritDoc
	 */
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