import * as net from "net";
import * as ws from "websocket";

import { WebAcceptor } from "../WebAcceptor";

export abstract class ServerBase
{
	/**
	 * @hidden
	 */
	private server_: net.Server;

	/**
	 * @hidden
	 */
	private adaptor_: ws.server;

	/**
	 * @hidden
	 */
	private status_: Status;

	protected constructor(server: any)
	{
		this.server_ = server;
		this.status_ = Status.NONE;
		this.adaptor_ = null;
	}

	public open(port: number, cb: (acceptor: WebAcceptor) => void | Promise<void>): Promise<void>
	{
		return new Promise((resolve, reject) =>
		{
			// PROTOCOL - ADAPTOR & ACCEPTOR
			if (this.adaptor_ === null)
			{
				this.adaptor_ = new ws.server({ httpServer: <any>this.server_ });
				this.adaptor_.on("request", request =>
				{
					let acceptor: WebAcceptor = WebAcceptor._Create(request);
					cb(acceptor);
				});
			}

			// PREPARE RETURNS
			this.server_.on("listening", () =>
			{
				this.status_ = Status.OPEN;
				resolve();
			});
			this.server_.on("error", error =>
			{
				this.status_ = Status.NONE;
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
			if (this.status_ !== Status.OPEN)
			{
				// SERVER IS NOT OPENED, OR CLOSED.
				reject(new Error("Server is not opened."));
				return;
			}
			
			// START CLOSING
			this.status_ = Status.CLOSING;
			this.server_.on("close", () =>
			{
				// BE CLOSED
				this.status_ = Status.CLOSED;
				resolve();
			});
			this.server_.close();
		});
	}
}

const enum Status
{
	NONE = -1,
	OPENING = 0,
	OPEN = 1,
	CLOSING = 2,
	CLOSED = 3
}