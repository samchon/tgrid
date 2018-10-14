import { CommunicatorBase } from "./CommunicatorBase";

import { IProtocol, ISender } from "./IProtocol";
import { Invoke } from "./Invoke";

export class Communicator<Listener extends object = {}>
	extends CommunicatorBase
	implements IProtocol
{
	/**
	 * @hidden
	 */
	private sender_: ISender;
	
	public constructor(sender: ISender, listener: Listener = null)
	{
		super(listener);
		this.sender_ = sender;
	}

	public sendData(invoke: Invoke): void
	{
		this.sender_(invoke);
	}
}