//================================================================ 
/** @module tgrid.protocols.web */
//================================================================
import * as ws from "websocket";
import * as http from "http";
import * as https from "https";

import { WebAcceptor } from "./WebAcceptor";
import { DomainError, RuntimeError } from "tstl/exception";

/**
 * Web Socket Server.
 * 
 * @see {@link WebAcceptor}, {@link WebConnector}
 * @author Jeongho Nam <http://samchon.org>
 */
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
	 * @param handler Callback function whenever client connects.
	 */
	public open(port: number, handler: (acceptor: WebAcceptor) => any): Promise<void>
	{
		return new Promise((resolve, reject) =>
		{
			//----
			// TEST CONDITION
			//----
			// POSSIBLE TO OPEN?
			if (!(this.state_ === WebServer.State.NONE || this.state_ === WebServer.State.CLOSED))
			{
				let exp: Error;
				if (this.state_ === WebServer.State.OPEN)
					exp = new DomainError("Server has already opened.");
				else if (this.state_ === WebServer.State.OPENING)
					exp = new DomainError("Server is on openeing; wait for a sec.");
				else if (this.state_ === WebServer.State.CLOSING)
					exp = new RuntimeError("Server is on closing.");

				reject(exp);
				return;
			}

			//----
			// OPEN SERVER
			//----
			// PROTOCOL - ADAPTOR & ACCEPTOR
			try
			{
				this.protocol_ = new ws.server({ httpServer: this.server_ });
				this.protocol_.on("request", request =>
				{
					let acceptor: WebAcceptor = new AcceptorFactory(request);
					handler(acceptor);
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

			// DO OPEN - START PROVIDE
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

/**
 * @hidden
 */
const AcceptorFactory:
{
	new(request: ws.request): WebAcceptor;
} = <any>WebAcceptor;