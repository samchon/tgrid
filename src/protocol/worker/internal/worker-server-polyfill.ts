//================================================================ 
/** @module tgrid.protocol.worker */
//================================================================
/**
 * @hidden
 */
class WorkerServerPolyfill
{
	public static postMessage(message: any): void
	{
		global.process.send(message);
	}

	public static close(): void
	{
		global.process.exit();
	}

	public static set onmessage(listener: (event: MessageEvent) => void)
	{
		global.process.on("message", msg =>
		{
			listener({data: msg} as MessageEvent);
		});
	}
}
export = WorkerServerPolyfill;