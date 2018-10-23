import * as cp from "child_process";

export class Worker
{
	private process_: cp.ChildProcess;

	public constructor(jsFile: string)
	{
		let idx: number = jsFile.indexOf(SYMBOL + " ");
		if (idx !== -1)
		{
			let file: string = jsFile.substr(0, idx + SYMBOL.length - 1);
			let content: string = jsFile.substr(idx + SYMBOL.length);

			this.process_ = cp.fork(file, [content]);
		}
		else
			this.process_ = cp.fork(jsFile);
	}

	public terminate(): void
	{
		this.process_.kill();
	}

	public set onmessage(listener: (event: MessageEvent) => void)
	{
		this.process_.on("message", message =>
		{
			listener({data: message} as MessageEvent);
		});
	}

	public postMessage(message: any): void
	{
		this.process_.send(message);
	}
}

const SYMBOL = "internal/eval.js";