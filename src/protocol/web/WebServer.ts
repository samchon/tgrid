import * as ws from "websocket";
import * as http from "http";
import * as https from "https";

import { WebAcceptor } from "./WebAcceptor";
import { DomainError } from "tstl/exception";

export class WebServer
{
	/**
	 * @hidden
	 */
	private server_: http.Server | https.Server;

	/**
	 * @hidden
	 */
	private protocol_: ws.server;

	/**
	 * @hidden
	 */
	private state_: WebServer.State;

	/* ----------------------------------------------------------------
		CONSTRUCTORS
	---------------------------------------------------------------- */
	/**
	 * Default Constructor for the `ws` server..
	 * 
	 * Create an websocket server (`ws://`).
	 */
	public constructor();

	/**
	 * Initializer Constructor for the `wss` server.
	 * 
	 * Create a secured websocket server (`wss://`).
	 * 
	 * @param key Key string.
	 * @param cert Certification string.
	 */
	public constructor(key: string, cert: string);

	public constructor(key: string = null, cert: string = null)
	{
		// PREPARE SREVER INSTANCE
		this.server_ = (key === null)
			? http.createServer()
			: https.createServer({ key: key, cert: cert });

		// SOCKET AND STATUS ARE YET
		this.protocol_ = null;
		this.state_ = WebServer.State.NONE;
	}

	/**
	 * Open server.
	 * 
	 * @param port Port number to listen.
	 * @param cb Callback function called whenever client connects.
	 */
	public open(port: number, cb: (acceptor: WebAcceptor) => void | Promise<void>): Promise<void>
	{
		return new Promise((resolve, reject) =>
		{
			// PROTOCOL - ADAPTOR & ACCEPTOR
			if (this.protocol_ === null)
			try
				{
					this.protocol_ = new ws.server({ httpServer: this.server_ });
					this.protocol_.on("request", request =>
					{
						let acceptor: WebAcceptor = new AcceptorFactory(request);
						cb(acceptor);
					});
				}
				catch (exp)
				{
					reject(exp);
					return;	
				}

			// PREPARE RETURNS
			this.server_.on("listening", () =>
			{
				this.state_ = WebServer.State.OPEN;
				resolve();
			});
			this.server_.on("error", error =>
			{
				this.state_ = WebServer.State.NONE;
				reject(error);
			});

			// DO OPEN - START LISTENING
			this.server_.listen(port);
		});
	}

	/**
	 * Close server.
	 */
	public close(): Promise<void>
	{
		return new Promise((resolve, reject) =>
		{
			if (this.state_ !== WebServer.State.OPEN)
			{
				// SERVER IS NOT OPENED, OR CLOSED.
				reject(new DomainError("Server is not opened."));
				return;
			}
			
			// START CLOSING
			this.state_ = WebServer.State.CLOSING;
			this.server_.on("close", () =>
			{
				// BE CLOSED
				this.state_ = WebServer.State.CLOSED;
				resolve();
			});
			this.server_.close();
		});
	}

	/* ----------------------------------------------------------------
		ACCESSORS
	---------------------------------------------------------------- */
	/**
	 * Get state.
	 * 
	 * @return Current state.
	 */
	public get state(): WebServer.State
	{
		return this.state_;
	}
}

export namespace WebServer
{
	export const enum State
	{
		NONE = -1,
		OPENING = 0,
		OPEN = 1,
		CLOSING = 2,
		CLOSED = 3
	}
}

const AcceptorFactory:
{
	new(request: ws.request): WebAcceptor;
} = <any>WebAcceptor;