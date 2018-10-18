import { 
	client as Client, 
	connection as Connection,
	IMessage
} from "websocket";

import { HashSet } from "tstl/container/HashSet";
import { HashMap } from "tstl/container/HashMap";

export class WebSocket
{
	/**
	 * @hidden
	 */
	private client_: Client;

	/**
	 * @hidden
	 */
	private connection_: Connection;

	/**
	 * @hidden
	 */
	private state_: number;

	/**
	 * @hidden
	 */
	private on_: Partial<Labmda<WebSocketEventMap>>;

	/**
	 * @hidden
	 */
	private listeners_: HashMap<string, HashSet<(event: Event) => void>>;

	/* ----------------------------------------------------------------
		CONSTRUCTORS
	---------------------------------------------------------------- */
	public constructor(url: string, protocols?: string | string[])
	{
		// DEFAULT STATE
		this.state_ = WebSocket.CONNECTING;

		// PREPARE HANDLERS
		this.on_ = {};
		this.listeners_ = new HashMap();

		//----
		// CLIENT
		//----
		// PREPARE SOCKET
		this.client_ = new Client();
		this.client_.on("connect", this._Handle_connect.bind(this));
		this.client_.on("connectFailed", this._Handle_error.bind(this));

		if (typeof protocols === "string")
			protocols = [protocols];

		// DO CONNECT
		this.client_.connect(url, protocols as string[]);
	}

	public close(code?: number, reason?: string): void
	{
		this.state_ = WebSocket.CLOSING;
		if (code === undefined)
			this.connection_.sendCloseFrame();
		else
			this.connection_.sendCloseFrame(code, reason, true);
	}

	/* ================================================================
		ACCESSORS
			- SENDER
			- PROPERTIES
			- LISTENERS
	===================================================================
		SENDER
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
		LISTENERS
	---------------------------------------------------------------- */
	public get onopen(): Listener<"open">
	{
		return this.on_.open;
	}
	public get onclose(): Listener<"close">
	{
		return this.on_.close;
	}
	public get onmessage(): Listener<"message">
	{
		return this.on_.message;
	}
	public get onerror(): Listener<"error">
	{
		return this.on_.error;
	}

	public set onopen(listener: Listener<"open">)
	{
		this._Set_on("open", listener);
	}
	public set onclose(listener: Listener<"close">)
	{
		this._Set_on("close", listener);
	}
	public set onmessage(listener: Listener<"message">)
	{
		this._Set_on("message", listener);
	}
	public set onerror(listener: Listener<"error">)
	{
		this._Set_on("error", listener);
	}

	/**
	 * @hidden
	 */
	private _Set_on<K extends keyof WebSocketEventMap>
		(type: K, listener: Listener<K>): void
	{
		if (this.on_[type])
			this.removeEventListener(type, <any>this.on_[type]);
		
		this.addEventListener(type, <any>listener);
		this.on_[type] = listener;
	}

	/* ================================================================
		EVENTS
			- DISPATCHER
			- HANDLERS
	===================================================================
		DISPATCHER
	---------------------------------------------------------------- */
	public dispatchEvent(event: Event): void
	{
		// FIND LISTENERS
		let it = this.listeners_.find(event.type);
		if (it.equals(this.listeners_.end()))
			return;

		// CALL THE LISTENERS
		for (let listener of it.second)
			listener(event);
	}

	public addEventListener<K extends keyof WebSocketEventMap>
		(type: K, listener: WebSocketEventMap[K]): void
	{
		let it = this.listeners_.find(<string>type);
		if (it.equals(this.listeners_.end()))
			it = this.listeners_.emplace(<string>type, new HashSet()).first;

		it.second.insert(<any>listener);
	}

	public removeEventListener<K extends keyof WebSocketEventMap>
		(type: string, listener: WebSocketEventMap[K]): void
	{
		let it = this.listeners_.find(type);
		if (it.equals(this.listeners_.end()))
			return;

		it.second.erase(<any>listener);
		if (it.second.empty())
			this.listeners_.erase(it);
	}

	/* ----------------------------------------------------------------
		HANDLERS
	---------------------------------------------------------------- */
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

		this.dispatchEvent({type: "open"} as Event);
	}

	/**
	 * @hidden
	 */
	private _Handle_close(code: number, reason: string): void
	{
		this.state_ = WebSocket.CLOSED;
		this.dispatchEvent({ type: "close",
			code: code, 
			reason: reason
		} as CloseEvent);
	}

	/**
	 * @hidden
	 */
	private _Handle_message(message: IMessage): void
	{
		this.dispatchEvent
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

		this.dispatchEvent({ type: "error",
			error: error,
			message: error.message
		} as ErrorEvent);
	}
}

export namespace WebSocket
{
	export const CONNECTING = 0;
	export const OPEN = 1;
	export const CLOSING = 2;
	export const CLOSED = 3;
}

type Listener<K extends keyof WebSocketEventMap> = (event: WebSocketEventMap[K]) => void;
type Labmda<T> = { [P in keyof T]: (event: T[P]) => void; }