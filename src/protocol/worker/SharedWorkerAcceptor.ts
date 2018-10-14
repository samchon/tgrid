import { CommunicatorBase } from "../../base/CommunicatorBase";
import { Invoke } from "../../base/Invoke";

export class SharedWorkerAcceptor extends CommunicatorBase
{
	private port_: MessagePort;

	public constructor(port: MessagePort)
	{
		super();
		this.port_ = port;
	}

	public close(): void
	{
		return this.port_.close();
	}

	public listen<Listener extends object = {}>
		(listener: Listener): void
	{
		this.listener_ = listener;

		this.port_.onmessage = evt =>
		{
			this.replyData(JSON.parse(evt.data));
		};
		this.port_.start();
	}

	public sendData(invoke: Invoke): void
	{
		this.port_.postMessage(JSON.stringify(invoke));
	}
}