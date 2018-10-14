import * as http from "http";
import * as ws from "websocket";
import { WebAcceptor } from "./WebAcceptor";

export class WebServer
{
	/**
	 * @hidden
	 */
	private server_: http.Server = null;

	public constructor()
	{
	}

	public open(port: number, cb: (acceptor: WebAcceptor) => void): void
	{
		// HTTP SERVER
		this.server_ = http.createServer();
		this.server_.listen(port);

		// PROTOCOL - ACCEPTOR
		let wServer: ws.server = new ws.server({ httpServer: this.server_ });
		wServer.on("request", request =>
		{
			let acceptor: WebAcceptor = new WebAcceptor(this, request);
			cb(acceptor);
		});
	}

	public close(): void
	{
		if (this.server_)
			this.server_.close();
	}
}