import { CommunicatorBase } from "../../base/CommunicatorBase";
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
	private cv_: ConditionVariable;

	/**
	 * @hidden
	 */
	private server_is_listening_: boolean;

	/**
	 * @hidden
	 */
	private closer_: ()=>void;

	/* ----------------------------------------------------------------
		CONSTRUCTOR
	---------------------------------------------------------------- */
	/**
	 * Initializer Constructor.
	 * 
	 * @param listener Listener controller for server.
	 */
	public constructor(listener: Listener = null)
	{
		super(listener);

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
			this.socket_ = new g.WebSocket(url, protocols);
			this.socket_.onopen = () =>
			{
				// RE-DEFINE HANDLERS
				this.socket_.onerror = this._Handle_error.bind(this);
				this.socket_.onmessage = this._Handle_message.bind(this);
				
				// RETURNS
				resolve();
			};
			this.socket_.onclose = this._Handle_close.bind(this);
			this.socket_.onerror = reject;
		});
	}

	/**
	 * Close connection.
	 * 
	 * @param code Closing code.
	 * @param reason Reason why.
	 */
	public close(code?: number, reason?: string): Promise<void>
	{
		return new Promise((resolve, reject) =>
		{
			if (this.state !== WebConnector.State.OPEN)
			{
				reject(new LogicError("Not conneced."));
				return;
			}

			this.closer_ = resolve;
			this.socket_.close(code, reason);
		});
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
	
	public get state(): WebConnector.State
	{
		if (!this.socket_)
			return WebConnector.State.NONE;
		else if (this.closer_)
			return WebConnector.State.CLOSING;
		else
			return this.socket_.readyState;
	}

	/* ----------------------------------------------------------------
		EVENT HANDLERS
	---------------------------------------------------------------- */
	public handleClose: (code: number, reason: string) => void;
	public handleError: (error: Error) => void;

	/**
	 * Wait for server to listen.
	 */
	public wait(): Promise<void>;

	/**
	 * Wait for server to listen or timeout.
	 * 
	 * @param ms The maximum milliseconds for waiting.
	 * @return Whether awaken by completion or timeout.
	 */
	public wait(ms: number): Promise<boolean>;

	/**
	 * Wait for server to listen or time expiration. 
	 * 
	 * @param at The maximum time point to wait.
	 * @return Whether awaken by completion or time expiration.
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
	 * @inheritDoc
	 */
	public sendData(invoke: Invoke): void
	{
		this.socket_.send(JSON.stringify(invoke));
	}

	/**
	 * @hidden
	 */
	protected _Is_ready(): Error
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
		if (evt.data === "LISTENING")
		{
			this.server_is_listening_ = true;
			this.cv_.notify_all();
		}
		else
			this.replyData(JSON.parse(evt.data));
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
			{
				this.closer_();
				this.closer_ = null;
			}
			
			// CUSTOM CLOSE HANDLER
			if (this.handleClose)
				this.handleClose(event.code, event.reason);
		});
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