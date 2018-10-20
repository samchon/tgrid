import { CommunicatorBase } from "./CommunicatorBase";

import { IProtocol } from "./IProtocol";
import { Invoke } from "./Invoke";

export class Communicator<Listener extends object = {}>
	extends CommunicatorBase
	implements IProtocol
{
	/**
	 * @hidden
	 */
	private sender_: Sender;

	/**
	 * @hidden
	 */
	private ready_inspector_: ReadyInspector;
	
	/* ----------------------------------------------------------------
		CONSTRUCTORS
	---------------------------------------------------------------- */
	/**
	 * Initializer Constructor.
	 * 
	 * @param sender A function sending data to remote system.
	 * @param readyInspector A function returning error when network is not ready. If ready, returns `null`.
	 * @param listener A controller provided for the remote system.
	 */
	public constructor(sender: Sender, readyInspector: ReadyInspector, listener: Listener = null)
	{
		super(listener);

		this.sender_ = sender;
		this.ready_inspector_ = readyInspector;
	}

	public destory(): Promise<void>
	{
		return this.destructor();
	}

	/* ----------------------------------------------------------------
		COMMUNICATIONS
	---------------------------------------------------------------- */
	public sendData(invoke: Invoke): void
	{
		this.sender_(invoke);
	}

	/**
	 * @hidden
	 */
	protected _Is_ready(): Error
	{
		return this.ready_inspector_();
	}
}

type Sender = (invoke: Invoke) => void;
type ReadyInspector = () => Error;