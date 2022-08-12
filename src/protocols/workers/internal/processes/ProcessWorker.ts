/** 
 * @packageDocumentation
 * @module tgrid.protocols.workers
 */
//----------------------------------------------------------------
import type __cp from "child_process";
import { is_node } from "tstl/utility/node";

const cp: typeof __cp = is_node() ? require("child_process") : null!;

/**
 * @hidden
 */
export class ProcessWorker
{
    private process_: __cp.ChildProcess;

    public constructor(jsFile: string, execArgv: string[] | undefined)
    {
        this.process_ = cp.fork(jsFile, { execArgv });
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