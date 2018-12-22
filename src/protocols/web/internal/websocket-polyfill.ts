//================================================================ 
/** @module tgrid.protocols.web */
//================================================================
import { 
	client as Client, 
	connection as Connection,
	IMessage
} from "websocket";
import { WebError } from "../WebError";

/**
 * @hidden
 */
export class WebSocket
{
	private client_: Client;
	private connection_: Connection;
	private state_: number;

	public onopen: Listener<"open">;
	public onclose: Listener<"close">;
	public onmessage: Listener<"message">;
	public onerror: Listener<"error">;

	/* ----------------------------------------------------------------
		CONSTRUCTORS
	---------------------------------------------------------------- */
	public constructor(url: string, protocols?: string | string[])
	{
		// DEFAULT STATE
		this.state_ = WebSocket.CONNECTING;

		//----
		// CLIENT
		//----
		// PREPARE SOCKET
		this.client_ = new Client();
		this.client_.on("connect", this._Handle_connect.bind(this));
		this.client_.on("connectFailed", () =>
		{
			let err = new WebError(1006, "Connection refused.");

			this._Handle_error(err);
			this._Handle_close(1006, err.message);
		});

		if (typeof protocols === "string")
			protocols = [protocols];

		// DO CONNECT
		this.client_.connect(url, protocols as string[]);
	}

	public close(code?: number, reason?: string): void
	{
		this.state_ = WebSocket.CLOSING;
		if (code === undefined)
			this.connection_.close();
		else
			this.connection_.sendCloseFrame(code, reason, true);
	}

	/* ----------------------------------------------------------------
		PROPERTIES
	---------------------------------------------------------------- */
	public get url(): string
	{
		return this.client_.url.href;
	}

	public get protocol(): string
	{
		return this.client_.protocols
			? this.client_.protocols[0]
			: "";
	}

	public get extensions(): string
	{
		return this.connection_ && this.connection_.extensions
			? this.connection_.extensions[0].name
			: "";
	}

	public get readyState(): number
	{
		return this.state_;
	}

	public get bufferedAmount(): number
	{
		return this.connection_.bytesWaitingToFlush;
	}

	public get binaryType(): string
	{
		return "arraybuffer";
	}

	/* ----------------------------------------------------------------
		SOCKET HANDLERS
	---------------------------------------------------------------- */
	public send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void
	{
		if (typeof data.valueOf() === "string")
			this.connection_.sendUTF(data);
		else
		{
			let buffer: Buffer;
			if (data instanceof Buffer)
				buffer = data;
			else if (data instanceof Blob)
				buffer = new Buffer(<any>data, "blob");
			else if ((data as ArrayBufferView).buffer)
				buffer = new Buffer((data as ArrayBufferView).buffer);
			else
				buffer = new Buffer(data as ArrayBufferLike);

			this.connection_.sendBytes(buffer);
		}
	}

	/**
	 * @hidden
	 */
	private _Handle_connect(connection: Connection): void
	{
		this.connection_ = connection;
		this.state_ = WebSocket.OPEN;

		this.connection_.on("message", this._Handle_message.bind(this));
		this.connection_.on("error", this._Handle_error.bind(this));
		this.connection_.on("close", this._Handle_close.bind(this));

		if (this.onopen)
			this.onopen({type: "open"} as Event);
	}

	/**
	 * @hidden
	 */
	private _Handle_close(code: number, reason: string): void
	{
		this.state_ = WebSocket.CLOSED;

		if (this.onclose)
			this.onclose({ type: "close",
				code: code, 
				reason: reason
			} as CloseEvent);
	}

	/**
	 * @hidden
	 */
	private _Handle_message(message: IMessage): void
	{
		if (this.onmessage)
			this.onmessage
			({
				type: "message", 
				data: message.binaryData
					? message.binaryData
					: message.utf8Data 
			} as MessageEvent);
	}

	/**
	 * @hidden
	 */
	private _Handle_error(error: Error): void
	{
		if (this.state_ === WebSocket.CONNECTING)
			this.state_ = WebSocket.CLOSED;

		if (this.onerror)
			this.onerror({ type: "error",
				error: error,
				message: error.message
			} as ErrorEvent);
	}
}

/**
 * @hidden
 */
export namespace WebSocket
{
	export const CONNECTING = 0;
	export const OPEN = 1;
	export const CLOSING = 2;
	export const CLOSED = 3;
}

/**
 * @hidden
 */
type Listener<K extends keyof WebSocketEventMap> = (event: WebSocketEventMap[K]) => void;