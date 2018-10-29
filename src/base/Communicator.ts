import { CommunicatorBase } from "./CommunicatorBase";

import { IProtocol } from "./IProtocol";
import { Invoke } from "./Invoke";

export class Communicator<Provider extends object = {}>
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
	 * @param provider A provider for the remote system.
	 */
	public constructor(sender: Sender, readyInspector: ReadyInspector, provider: Provider = null)
	{
		super(provider);

		this.sender_ = sender;
		this.ready_inspector_ = readyInspector;
	}

	public destory(error: Error = null): Promise<void>
	{
		return this.destructor(error);
	}

	/* ----------------------------------------------------------------
		COMMUNICATIONS
	---------------------------------------------------------------- */
	/**
	 * @inheritDoc
	 */
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