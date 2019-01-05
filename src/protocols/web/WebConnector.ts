//================================================================ 
/** @module tgrid.protocols.web */
//================================================================
import { CommunicatorBase } from "../../basic/CommunicatorBase";
import { IWebCommunicator } from "./internal/IWebCommunicator";
import { IConnector } from "../internal/IConnector";

import { Invoke } from "../../basic/Invoke";
import { WebError } from "./WebError";
import { DomainError } from "tstl/exception";
import { ConditionVariable } from "tstl/thread/ConditionVariable";
import { is_node } from "tstl/utility/node";

/**
 * Web Socket Connector.
 * 
 * The `WebConnector` is a communicator class who can connect to websocket server and 
 * communicate with it using RFC (Remote Function Call).
 * 
 * You can connect to the websocket server using {@link connect}() method, and enjoy the 
 * RFC (Remote Function Call), if the server is opened through the {@link WebServer.open}()
 * and the server is ready for you by calling the {@link WebAcceptor.listen}() method.
 * 
 * Note that, although you called the {@link connect}() method and the connection has been 
 * succeded, it means only server {@link WebAcceptor.accept accepted} your connection request. 
 * The acceptance does not mean that server is ready to start communication directly. The 
 * server would be ready when it calls the {@link WEbAcceptor.listen}() method. If you want to 
 * ensure the server to be ready, call the {@link wait}() method.
 * 
 * @wiki https://github.com/samchon/tgrid/wiki/Web-Socket
 * @author Jeongho Nam <http://samchon.org>
 */
export class WebConnector<Provider extends object = {}>
	extends CommunicatorBase<Provider>
	implements IWebCommunicator, IConnector<WebConnector.State>
{
	/**
	 * @hidden
	 */
	private socket_: WebSocket;

	/**
	 * @hidden
	 */
	private wait_cv_: ConditionVariable;

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
		this.wait_cv_ = new ConditionVariable();
		this.server_is_listening_ = false;
	}
	
	/**
	 * Connect to remote websocket server.
	 * 
	 * Try connection to the remote websocket server with its address and waiting for the
	 * server to accept the trial. If the server rejects your connection, then exception 
	 * would be thrown (in *Promise.catch*, as `WebError`).
	 * 
	 * Note that, although the connection has been succeded, it means only server accepted 
	 * your connection request; {@link WebAcceptor.accept}(). The acceptance does not mean 
	 * that server is ready to start communication directly. The server would be ready when 
	 * it calls the {@link WebAcceptor.listen}() method. If you want to ensure the server to 
	 * be ready, call the {@link wait}() method.
	 * 
	 * @param url URL address to connect.
	 * @param protocols Protocols to use.
	 */
	public connect(url: string, protocols?: string | string[]): Promise<void>
	{
		return new Promise((resolve, reject) =>
		{
			// TEST CONDITION
			if (this.socket_ && this.state !== WebConnector.State.CLOSED)
			{
				let err: Error;
				if (this.socket_.readyState === WebConnector.State.CONNECTING)
					err = new DomainError("On connection.");
				else if (this.socket_.readyState === WebConnector.State.OPEN)
					err = new DomainError("Already connected.");
				else
					err = new DomainError("Closing.");

				reject(err);
				return;
			}

			//----
			// CONNECTOR
			//----
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
			this.socket_.onerror = () =>
			{
				reject(new WebError(1006, "Connection refused."));
			};
		});
	}

	/**
	 * @inheritDoc
	 */
	public async close(code?: number, reason?: string): Promise<void>
	{
		// TEST CONDITION
		let error: Error = this.inspector();
		if (error)
			throw error;
		
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
	 * Wait server to be ready.
	 * 
	 * Wait the server to call the {@link WebAcceptor.listen}() method.
	 */
	public wait(): Promise<void>;

	/**
	 * Wait server to be ready or timeout.
	 * 
	 * @param ms The maximum milliseconds for waiting.
	 * @return Whether awaken by completion or timeout.
	 */
	public wait(ms: number): Promise<boolean>;

	/**
	 * Wait server to be ready or time expiration.
	 * 
	 * @param at The maximum time point to wait.
	 * @return Whether awaken by completion or time expiration.
	 */
	public wait(at: Date): Promise<boolean>;

	public async wait(param: number | Date = null): Promise<void|boolean>
	{
		// TEST CONDITION
		let error: Error = this.inspector();
		if (error)
			throw error;

		//----
		// WAIT SERVER
		//----
		// PREPARE PREDICATOR
		let predicator = () => this.server_is_listening_;

		// SPECIALZE BETWEEN OVERLOADED FUNCTIONS
		if (param === null)
			return await this.wait_cv_.wait(predicator);
		else if (param instanceof Date)
			return await this.wait_cv_.wait_until(param, predicator);
		else
			return await this.wait_cv_.wait_for(param, predicator);
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
		return IConnector.inspect(this.state);
	}

	/**
	 * @hidden
	 */
	private _Handle_message(evt: MessageEvent): void
	{
		if (evt.data === "PROVIDE")
			this._Handle_provide();
		else
			this.replier(JSON.parse(evt.data));
	}

	/**
	 * @hidden
	 */
	private async _Handle_provide(): Promise<void>
	{
		this.server_is_listening_ = true;
		await this.wait_cv_.notify_all();
	}

	/**
	 * @hidden
	 */
	private _Handle_error({}: Event): void
	{
		// HANDLING ERRORS ON CONNECTION, 
		// THAT'S NOT IMPLEMENTED YET
	}

	/**
	 * @hidden
	 */
	private async _Handle_close(event: CloseEvent): Promise<void>
	{
		let error: WebError = (!event.code || event.code !== 1000)
			? new WebError(event.code, event.reason)
			: undefined;
		
		this.server_is_listening_ = false;
		await this.destructor(error);
	}
}

export namespace WebConnector
{
	export import State = IConnector.State;
}

//----
// POLYFILL
//----
/**
 * @hidden
 */
const g: IFeature = is_node()
	? require("./internal/websocket-polyfill")
	: <any>self;

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