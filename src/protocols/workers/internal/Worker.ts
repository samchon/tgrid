//================================================================ 
/** @module tgrid.protocols.workers */
//================================================================
import cp = require("child_process");

/**
 * @hidden
 */
export class Worker
{
    private process_: cp.ChildProcess;

    public constructor(jsFile: string, ...args: string[])
    {
        this.process_ = cp.fork(jsFile, args);
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