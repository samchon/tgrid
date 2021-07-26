/** 
 * @packageDocumentation
 * @module tgrid.protocols.workers
 */
//----------------------------------------------------------------
import cp from "child_process";

/**
 * @hidden
 */
export class Worker
{
    private process_: cp.ChildProcess;

    public constructor(jsFile: string, argv: string[] | undefined)
    {
        this.process_ = cp.fork(jsFile, argv);
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