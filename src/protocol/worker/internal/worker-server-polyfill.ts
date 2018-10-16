class WorkerServerPolyfill
{
	public static postMessage(message: any): void
	{
		process.send(message);
	}

	public static close(): void
	{
		process.exit();
	}

	public static set onmessage(listener: (event: MessageEvent) => void)
	{
		process.on("message", msg =>
		{
			listener({data: msg} as MessageEvent);
		});
	}
}
export = WorkerServerPolyfill;