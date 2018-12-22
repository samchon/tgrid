//================================================================ 
/** @module tgrid.protocols.workers */
//================================================================
import { CommunicatorBase } from "../../basic/CommunicatorBase";
import { IAcceptor } from "../internal/IAcceptor";
import { Invoke } from "../../basic/Invoke";

export class SharedWorkerAcceptor 
	extends CommunicatorBase
	implements IAcceptor<SharedWorkerAcceptor.State>
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
	private state_: SharedWorkerAcceptor.State;

	/**
	 * @hidden
	 */
	private listening_: boolean;

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
		this.eraser_ = eraser;

		// PROPERTIES
		this.state_ = SharedWorkerAcceptor.State.NONE;
		this.listening_ = false;
	}

	/**
	 * Close connection.
	 */
	public async close(): Promise<void>
	{
		this.state_ = SharedWorkerAcceptor.State.CLOSING;
		await this._Close("CLOSE");
	}

	/**
	 * @hidden
	 */
	private async _Close(message: string): Promise<void>
	{
		// CALL HANDLERS
		this.eraser_();
		this.port_.postMessage(message);

		// DO CLOSE
		await this.destructor();
		this.port_.close();

		// WELL, IT MAY HARD TO SEE SUCH PROPERTIES
		this.state_ = SharedWorkerAcceptor.State.CLOSED;
		this.listening_ = false;
	}

	/* ----------------------------------------------------------------
		ACCESSORS
	---------------------------------------------------------------- */
	/**
	 * @inheritDoc
	 */
	public get state(): SharedWorkerAcceptor.State
	{
		return this.state_;
	}

	/* ----------------------------------------------------------------
		HANDSHAKES
	---------------------------------------------------------------- */
	/**
	 * Accept connection.
	 */
	public async accept(): Promise<void>
	{
		this.state_ = SharedWorkerAcceptor.State.ACCEPTING;
		{
			// PREPARE PORT
			this.port_.onmessage = this._Handle_message.bind(this);
			this.port_.start();

			// INFORM ACCEPTANCE
			this.port_.postMessage("ACCEPT");
		}
		this.state_ = SharedWorkerAcceptor.State.OPEN;
	}

	/**
	 * Reject connection.
	 */
	public async reject(): Promise<void>
	{
		this.state_ = SharedWorkerAcceptor.State.REJECTING;
		await this._Close("REJECT");
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
		return IAcceptor.inspect(this.state_);
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

export namespace SharedWorkerAcceptor
{
	export import State = IAcceptor.State;
}