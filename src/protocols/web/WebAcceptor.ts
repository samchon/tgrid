//================================================================ 
/** @module tgrid.protocols.web */
//================================================================
import * as ws from "websocket";

import { CommunicatorBase } from "../../basic/CommunicatorBase";
import { IAcceptor } from "../internal/IAcceptor";
import { Invoke } from "../../basic/Invoke";

import { LogicError, RuntimeError } from "tstl/exception";

export class WebAcceptor 
	extends CommunicatorBase 
	implements IAcceptor
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
		this.connection_ = null;
	}

	/**
	 * Close connection.
	 */
	public async close(): Promise<void>
	{
		// VALIDATIONS
		if (this.connection_ === null)
			throw new LogicError("Not accepted.");
		else if (!this.connection_.connected)
			throw new RuntimeError("Not connected.");

		//----
		// CLOSE WITH JOIN
		//----
		// DO CLOSE
		let ret: Promise<void> = this.join();
		this.connection_.close();

		// LAZY RETURN
		await ret;
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
	 * @inheritdoc
	 */
	public async listen<Provider extends object>
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

	/* ----------------------------------------------------------------
		COMMUNICATOR
	---------------------------------------------------------------- */
	/**
	 * @hidden
	 */
	protected sender(invoke: Invoke): void
	{
		this.connection_.sendUTF(JSON.stringify(invoke));
	}

	/**
	 * @hidden
	 */
	protected inspector(): Error
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
		this.replier(invoke);
	}

	/**
	 * @hidden
	 */
	private _Handle_close({}: number, {}: string): void
	{
		// DESTRUCT UNRETURNED FUNCTIONS
		this.destructor();
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