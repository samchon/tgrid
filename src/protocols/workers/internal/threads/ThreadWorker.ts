//================================================================ 
/** @module tgrid.protocols.workers */
//================================================================
import type __thread from "worker_threads";
import { is_node } from "tstl/utility/node";

const thread: typeof __thread = is_node() ? require("worker_threads") : null!;

/**
 * @hidden
 */
export class ThreadWorker
{
    private readonly worker_: __thread.Worker;
    
    public constructor(jsFile: string, execArgv: string[] | undefined)
    {
        this.worker_ = new thread.Worker(jsFile, { execArgv });
    }

    public terminate(): void
    {
        this.worker_.terminate();
    }

    public set onmessage(listener: (event: MessageEvent) => void)
    {
        this.worker_.on("message", value =>
        {
            listener({data: value} as MessageEvent);
        });
    }

    public postMessage(message: any): void
    {
        this.worker_.postMessage(message);
    }
}