import { CommunicatorBase } from "../../base/CommunicatorBase";
import { Invoke } from "../../base/Invoke";

export class SharedWorkerAcceptor extends CommunicatorBase
{
	/**
	 * @hidden
	 */
	private port_: MessagePort;

	/* ----------------------------------------------------------------
		CONSTRUCTOR
	---------------------------------------------------------------- */
	public constructor(port: MessagePort)
	{
		super();
		this.port_ = port;
	}

	public close(): void
	{
		return this.port_.close();
	}

	public listen<Listener extends object>
		(listener: Listener): void
	{
		this.listener_ = listener;
		
		this.port_.onmessage = this._Handle_message.bind(this);
		this.port_.start();
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
		this.replyData(JSON.parse(evt.data));
	}
}