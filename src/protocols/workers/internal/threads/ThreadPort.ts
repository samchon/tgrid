//================================================================ 
/** @module tgrid.protocols.workers */
//================================================================
import type __thread from "worker_threads";
import { is_node } from "tstl/utility/node";

const thread: typeof __thread = is_node() ? require("worker_threads") : null!;

/**
 * @hidden
 */
export class ThreadPort
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
        return !thread.parentPort
            ? null! as Document // NOT WORKER
            : undefined;
    }

    public static is_worker_server(): boolean
    {
        return !!thread.parentPort;
    }
}