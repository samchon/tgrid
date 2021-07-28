//================================================================ 
/** @module tgrid.protocols.workers */
//================================================================
import type _thread from "worker_threads";
import { is_node } from "tstl/utility/node";

let thread: typeof _thread = null!;
if (is_node() === true)
    thread = require("worker_threads");

/**
 * @hidden
 */
class ThreadPort
{
    public static postMessage(message: any): void
    {
        thread.parentPort!.postMessage(message);
    }

    public static close(): void
    {
        global.process.exit(0);
    }

    public static set onmessage(listener: (event: MessageEvent) => void)
    {
        thread.parentPort!.on("message", msg =>
        {
            listener({data: msg} as MessageEvent);
        });
    }

    public static get document(): Document | undefined
    {
        return (thread.parentPort === null)
            ? null! as Document // NOT WORKER
            : undefined;
    }

    public static is_worker_server(): boolean
    {
        return thread.parentPort !== undefined;
    }
}
export = ThreadPort;