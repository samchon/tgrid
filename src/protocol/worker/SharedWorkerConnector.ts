import { CommunicatorBase } from "../../base/CommunicatorBase";
import { Invoke } from "../../base/Invoke";

export class SharedWorkerConnector<Listener extends Object = {}>
	extends CommunicatorBase<Listener>
{
	private port_: MessagePort;

	public constructor(listener: Listener = null)
	{
		super(listener);
	}

	public connect(jsFile: string, name?: string): void
	{
		let worker = new SharedWorker(jsFile, name);
		
		this.port_ = worker.port;
		this.port_.onmessage = evt =>
		{
			this.replyData(JSON.parse(evt.data));
		};
		this.port_.start();
	}

	public close(): void
	{
		this.port_.close();
	}

	public sendData(invoke: Invoke): void
	{
		this.port_.postMessage(JSON.stringify(invoke));
	}
}