import { CommunicatorBase } from "../../../base/CommunicatorBase";
import { Invoke } from "../../../base/Invoke";

export class WorkerConnector<Listener extends object = {}> 
	extends CommunicatorBase<Listener>
{
	/**
	 * @hidden
	 */
	private worker_: Worker;

	public constructor(listener: Listener = null)
	{
		super(listener);
	}

	public connect(jsFile: string): void
	{
		this.worker_ = new Worker(jsFile);
		this.worker_.onmessage = evt =>
		{
			this.replyData(JSON.parse(evt.data));
		};
	}

	public close(): void
	{
		this.worker_.terminate();
	}

	public sendData(invoke: Invoke): void
	{
		this.worker_.postMessage(JSON.stringify(invoke));
	}
}