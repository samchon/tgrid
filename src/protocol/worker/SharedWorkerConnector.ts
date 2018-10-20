import { CommunicatorBase } from "../../base/CommunicatorBase";
import { Invoke } from "../../base/Invoke";

export class SharedWorkerConnector<Listener extends Object = {}>
	extends CommunicatorBase<Listener>
{
	/**
	 * @hidden
	 */
	private port_: MessagePort;

	/* ----------------------------------------------------------------
		CONSTRUCTOR
	---------------------------------------------------------------- */
	public constructor(listener: Listener = null)
	{
		super(listener);
	}

	public async connect(jsFile: string, name?: string): Promise<void>
	{
		let worker = new SharedWorker(jsFile, name);
		
		this.port_ = worker.port;
		this.port_.onmessage = evt =>
		{
			this.replyData(JSON.parse(evt.data));
		};
		this.port_.start();
	}

	public async close(): Promise<void>
	{
		this.port_.close();
	}

	/* ----------------------------------------------------------------
		COMMUNICATOR
	---------------------------------------------------------------- */
	public sendData(invoke: Invoke): void
	{
		this.port_.postMessage(JSON.stringify(invoke));
	}

	protected _Is_ready(): Error
	{
		return null;
	}
}