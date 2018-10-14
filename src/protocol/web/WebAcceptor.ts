import * as ws from "websocket";

import { WebServer } from "./WebServer";
import { CommunicatorBase } from "../../base/CommunicatorBase";
import { Invoke } from "../../base/Invoke";

export class WebAcceptor extends CommunicatorBase
{
	/**
	 * @hidden
	 */
	private server_: WebServer;

	/**
	 * @hidden
	 */
	private request_: ws.request;

	/**
	 * @hidden
	 */
	private connection_: ws.connection;

	/* ----------------------------------------------------------------
		CONSTRUCTORS
	---------------------------------------------------------------- */
	public constructor(server: WebServer, request: ws.request)
	{
		super();

		this.server_ = server;
		this.request_ = request;
	}

	public accept(protocol?: string, allowOrigin?: string, cookies?: ws.ICookie[]): void
	{
		this.connection_ = this.request_.accept(protocol, allowOrigin, cookies);
		this.connection_.on("close", this._Handle_close.bind(this));
		this.connection_.on("error", this._Handle_error.bind(this));
	}

	public listen<Listener extends object = {}>
		(listener: Listener): void
	{
		this.listener_ = listener;
		this.connection_.on("message", this._Handle_message.bind(this));
	}

	/* ----------------------------------------------------------------
		ACCESSORS
	---------------------------------------------------------------- */
	public getServer(): WebServer
	{
		return this.server_;
	}

	public getPath(): string
	{
		return this.request_.resource;
	}

	/* ----------------------------------------------------------------
		MESSAG I/O
	---------------------------------------------------------------- */
	public sendData(invoke: Invoke): void
	{
		this.connection_.sendUTF(JSON.stringify(invoke));
	}
	private _Handle_message(message: ws.IMessage): void
	{
		let invoke: Invoke = JSON.parse(message.utf8Data);
		this.replyData(invoke);
	}

	private _Handle_close(code: number, reason: string): void
	{
		console.log(code, reason);
	}
	private _Handle_error(error: Error): void
	{
		console.log(error);
	}
}