import * as cp from "child_process";

import { CommunicatorBase } from "../../../base/CommunicatorBase";
import { Invoke } from "../../../base/Invoke";

export class ProcessConnector<Listener extends object = {}> 
	extends CommunicatorBase<Listener>
{
	/**
	 * @hidden
	 */
	private worker_: cp.ChildProcess;

	public constructor(listener: Listener = null)
	{
		super(listener);
	}

	public connect(jsFile: string): void
	{
		this.worker_ = cp.fork(jsFile);
		this.worker_.on("message", msg =>
		{
			this.replyData(JSON.parse(msg));
		});
	}

	public close(): void
	{
		this.worker_.kill();
	}

	public sendData(invoke: Invoke): void
	{
		this.worker_.send(JSON.stringify(invoke));
	}
}