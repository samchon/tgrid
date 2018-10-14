import { CommunicatorBase } from "../../../base/CommunicatorBase";
import { Invoke } from "../../../base/Invoke";

export class WorkerServer<Listener extends object = {}> 
	extends CommunicatorBase<Listener>
{
	public constructor(listener: Listener = null)
	{
		super(listener);
	}

	public close(): void
	{
		close();
	}

	public sendData(invoke: Invoke): void
	{
		postMessage(JSON.stringify(invoke), "");
	}
}