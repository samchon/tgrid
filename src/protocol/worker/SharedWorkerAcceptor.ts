import { CommunicatorBase } from "../../base/CommunicatorBase";
import { Invoke } from "../../base/Invoke";

export class SharedWorkerAcceptor extends CommunicatorBase
{
	/**
	 * @hidden
	 */
	private port_: MessagePort;

	/**
	 * @hidden
	 */
	private listening_: boolean;

	/* ----------------------------------------------------------------
		CONSTRUCTOR
	---------------------------------------------------------------- */
	public constructor(port: MessagePort)
	{
		super();
		this.port_ = port;
	}

	public async close(): Promise<void>
	{
		// DESTRUCT & INFORM TO CLIENT
		await this.destructor();
		this.port_.postMessage("CLOSE");

		// DO CLOSE
		this.port_.close();
	}

	/* ----------------------------------------------------------------
		HANDSHAKES
	---------------------------------------------------------------- */
	public async accept(): Promise<void>
	{
		this.port_.onmessage = this._Handle_message.bind(this);
		this.port_.start();

		this.port_.postMessage("ACCEPT");
	}

	public async listen<Listener extends object>
		(listener: Listener): Promise<void>
	{
		// ASSIGN LISTENER
		this.listener_ = listener;
		if (this.listening_ === true)
			return;
		
		// INFORM READY TO CLIENT
		this.listening_ = true;
		this.port_.postMessage("LISTENING");
	}

	/* ----------------------------------------------------------------
		COMMUNICATOR
	---------------------------------------------------------------- */
	public sendData(invoke: Invoke): void
	{
		this.port_.postMessage(JSON.stringify(invoke));
	}

	/**
	 * @hidden
	 */
	protected _Is_ready(): Error
	{
		return null;
	}

	/**
	 * @hidden
	 */
	private _Handle_message(evt: MessageEvent): void
	{
		if (evt.data === "CLOSE")
			this.close();
		else
			this.replyData(JSON.parse(evt.data));
	}
}