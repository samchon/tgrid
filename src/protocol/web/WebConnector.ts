import { CommunicatorBase } from "../../base/CommunicatorBase";
import { IConnector } from "../internal/IConnector";
import { Invoke } from "../../base/Invoke";

import { LogicError, RuntimeError } from "tstl/exception";
import { ConditionVariable } from "tstl/thread/ConditionVariable";
import { is_node } from "tstl/utility/node";

//----
// POLYFILL
//----
/**
 * @hidden
 */
var g: IFeature = is_node()
	? require("./internal/websocket-polyfill")
	: <any>self;

export class WebConnector<Provider extends object = {}>
	extends CommunicatorBase<Provider>
	implements IConnector<WebConnector.State>
{
	/**
	 * @hidden
	 */
	private socket_: WebSocket;

	/**
	 * @hidden
	 */
	private cv_: ConditionVariable;

	/**
	 * @hidden
	 */
	private server_is_listening_: boolean;

	/* ----------------------------------------------------------------
		CONSTRUCTOR
	---------------------------------------------------------------- */
	/**
	 * Initializer Constructor.
	 * 
	 * @param provider A provider for server.
	 */
	public constructor(provider: Provider = null)
	{
		super(provider);

		this.socket_ = null;
		this.cv_ = new ConditionVariable();
		this.server_is_listening_ = false;
	}
	
	/**
	 * Connect to remote web socket server.
	 * 
	 * @param url URL address to connect.
	 * @param protocols Protocols to use.
	 */
	public connect(url: string, protocols?: string | string[]): Promise<void>
	{
		return new Promise((resolve, reject) =>
		{
			// INSPECTOR
			if (this.socket_ && this.state !== WebConnector.State.CLOSED)
			{
				let err: Error;
				if (this.socket_.readyState === WebConnector.State.CONNECTING)
					err = new LogicError("On connection.");
				else if (this.socket_.readyState === WebConnector.State.OPEN)
					err = new LogicError("Already connected.");
				else
					err = new LogicError("Closing.");

				reject(err);
				return;	
			}

			// OPEN A SOCKET
			try
			{
				this.socket_ = new g.WebSocket(url, protocols);
			}
			catch (exp)
			{
				reject(exp);
				return;
			}

			// SET EVENT HANDLERS
			this.socket_.onopen = () =>
			{
				// RE-DEFINE HANDLERS
				this.socket_.onerror = this._Handle_error.bind(this);
				this.socket_.onmessage = this._Handle_message.bind(this);
				
				// RETURNS
				resolve();
			};
			this.socket_.onclose = this._Handle_close.bind(this);
			this.socket_.onerror = (evt: ErrorEvent) =>
			{
				reject(evt.error);
			};
		});
	}

	/**
	 * Close connection.
	 * 
	 * @param code Closing code.
	 * @param reason Reason why.
	 */
	public async close(code?: number, reason?: string): Promise<void>
	{
		// VALIDATION
		if (this.state !== WebConnector.State.OPEN)
			throw new LogicError("Not conneced.");
		
		//----
		// CLOSE WITH JOIN
		//----
		// DO CLOSE
		let ret: Promise<void> = this.join();
		this.socket_.close(code, reason);

		// LAZY RETURN
		await ret;
	}

	/* ----------------------------------------------------------------
		ACCESSORS
	---------------------------------------------------------------- */
	public get url(): string
	{
		return this.socket_.url;
	}

	public get protocol(): string
	{
		return this.socket_.protocol;
	}

	public get extensions(): string
	{
		return this.socket_.extensions;
	}
	
	/**
	 * @inheritDoc
	 */
	public get state(): WebConnector.State
	{
		if (!this.socket_)
			return WebConnector.State.NONE;
		else
			return this.socket_.readyState;
	}

	/* ----------------------------------------------------------------
		EVENT HANDLERS
	---------------------------------------------------------------- */
	/**
	 * @inheritDoc
	 */
	public wait(): Promise<void>;

	/**
	 * @inheritDoc
	 */
	public wait(ms: number): Promise<boolean>;

	/**
	 * @inheritDoc
	 */
	public wait(at: Date): Promise<boolean>;

	public async wait(param: number | Date = null): Promise<void|boolean>
	{
		if (this.server_is_listening_ === true)
			return true;

		if (param === null)
			return await this.cv_.wait();
		else if (param instanceof Date)
			return await this.cv_.wait_until(param);
		else
			return await this.cv_.wait_for(param as number);
	}

	/* ----------------------------------------------------------------
		COMMUNICATOR
	---------------------------------------------------------------- */
	/**
	 * @hidden
	 */
	protected sender(invoke: Invoke): void
	{
		this.socket_.send(JSON.stringify(invoke));
	}

	/**
	 * @hidden
	 */
	protected inspector(): Error
	{
		if (this.socket_.readyState !== g.WebSocket.OPEN)
			return new LogicError("Not connected.");
		else if (this.server_is_listening_ === false)
			return new RuntimeError("Server is not listening.");
		else
			return null;
	}

	/**
	 * @hidden
	 */
	private _Handle_message(evt: MessageEvent): void
	{
		if (evt.data === "PROVIDE")
		{
			this.server_is_listening_ = true;
			this.cv_.notify_all();
		}
		else
			this.replier(JSON.parse(evt.data));
	}

	/**
	 * @hidden
	 */
	private _Handle_error({}: ErrorEvent): void
	{
		// NOT IMPLEMENTED YET
	}

	/**
	 * @hidden
	 */
	private _Handle_close({}: CloseEvent): void
	{
		this.destructor();
	}
}

export namespace WebConnector
{
	export const enum State
	{
		NONE = -1,
		CONNECTING,
		OPEN,
		CLOSING,
		CLOSED
	}
}

/**
 * @hidden
 */
interface IFeature
{
	WebSocket: WebSocket &
	{
		new(url: string, protocols?: string | string[]): WebSocket;
	};
}