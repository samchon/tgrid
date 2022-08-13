//================================================================ 
/** @module tgrid.protocols.workers */
//================================================================
import type thread from "worker_threads";
import { NodeModule } from "../../../../utils/internal/NodeModule";
import { IWorkerCompiler } from "../IWorkerCompiler";

/**
 * @hidden
 */
export async function ThreadWorker(): Promise<IWorkerCompiler.Creator>
{
    const { Worker } = await NodeModule.thread.get();
    class ThreadWorker {
        private readonly worker_:thread.Worker;
        
        public constructor(jsFile: string, execArgv: string[] | undefined)
        {
            this.worker_ = new Worker(jsFile, { execArgv });
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
    return <any>ThreadWorker as IWorkerCompiler.Creator;
}