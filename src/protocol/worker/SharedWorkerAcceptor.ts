import { CommunicatorBase } from "../../base/CommunicatorBase";
import { IAcceptor } from "../internal/IAcceptor";
import { Invoke } from "../../base/Invoke";

export class SharedWorkerAcceptor 
	extends CommunicatorBase
	implements IAcceptor
{
	/**
	 * @hidden
	 */
	private port_: MessagePort;

	/**
	 * @hidden 
	 */
	private eraser_: ()=>void;

	/**
	 * @hidden
	 */
	private listening_: boolean;

	/**
	 * @inheritDoc
	 */
	public handleClose: ()=>void;

	/* ----------------------------------------------------------------
		CONSTRUCTOR
	---------------------------------------------------------------- */
	/**
	 * @hidden
	 */
	private constructor(port: MessagePort, eraser: ()=>void)
	{
		super();

		// ASSIGN MEMBER
		this.port_ = port;

		// HANDLERS
		this.eraser_ = eraser;
		this.handleClose = null;
	}

	/**
	 * Close connection.
	 */
	public async close(): Promise<void>
	{
		// CALL HANDLERS
		this.eraser_();
		await this.destructor();

		if (this.handleClose)
			this.handleClose();

		// DO CLOSE
		this.port_.postMessage("CLOSE");
		this.port_.close();
	}

	/* ----------------------------------------------------------------
		HANDSHAKES
	---------------------------------------------------------------- */
	/**
	 * Accept connection.
	 */
	public async accept(): Promise<void>
	{
		this.port_.onmessage = this._Handle_message.bind(this);
		this.port_.start();

		this.port_.postMessage("ACCEPT");
	}

	/**
	 * Reject connection.
	 */
	public async reject(): Promise<void>
	{
		this.port_.postMessage("REJECT");

		this.eraser_();
		this.port_.close();
	}

	/**
	 * @inheritDoc
	 */
	public async listen<Provider extends object>
		(provider: Provider): Promise<void>
	{
		// ASSIGN LISTENER
		this.provider_ = provider;
		if (this.listening_ === true)
			return;
		
		// INFORM READY TO CLIENT
		this.listening_ = true;
		this.port_.postMessage("PROVIDE");
	}

	/* ----------------------------------------------------------------
		COMMUNICATOR
	---------------------------------------------------------------- */
	/**
	 * @hidden
	 */
	protected sender(invoke: Invoke): void
	{
		this.port_.postMessage(JSON.stringify(invoke));
	}
	
	/**
	 * @hidden
	 */
	protected inspector(): Error
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
			this.replier(JSON.parse(evt.data));
	}
}