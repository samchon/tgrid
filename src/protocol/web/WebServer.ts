import * as ws from "websocket";
import * as http from "http";
import * as https from "https";

import { WebAcceptor } from "./WebAcceptor";

export class WebServer
{
	/**
	 * @hidden
	 */
	private server_: http.Server | https.Server;

	/**
	 * @hidden
	 */
	private socket_: ws.server;

	/**
	 * @hidden
	 */
	private state_: WebServer.State;

	/* ----------------------------------------------------------------
		CONSTRUCTORS
	---------------------------------------------------------------- */
	public constructor();
	public constructor(key: string, cert: string);

	public constructor(key: string = null, cert: string = null)
	{
		// PREPARE SREVER INSTANCE
		this.server_ = (key === null)
			? http.createServer()
			: https.createServer({ key: key, cert: cert });

		// SOCKET AND STATUS ARE YET
		this.socket_ = null;
		this.state_ = WebServer.State.NONE;
	}

	public open(port: number, cb: (acceptor: WebAcceptor) => void | Promise<void>): Promise<void>
	{
		return new Promise((resolve, reject) =>
		{
			// PROTOCOL - ADAPTOR & ACCEPTOR
			if (this.socket_ === null)
			{
				this.socket_ = new ws.server({ httpServer: this.server_ });
				this.socket_.on("request", request =>
				{
					let acceptor: WebAcceptor = WebAcceptor._Create(request);
					cb(acceptor);
				});
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

	public close(): Promise<void>
	{
		return new Promise((resolve, reject) =>
		{
			if (this.state_ !== WebServer.State.OPEN)
			{
				// SERVER IS NOT OPENED, OR CLOSED.
				reject(new Error("Server is not opened."));
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
