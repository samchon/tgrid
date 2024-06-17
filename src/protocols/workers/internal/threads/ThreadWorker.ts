import type thread from "worker_threads";

import { NodeModule } from "../../../../utils/internal/NodeModule";
import { WorkerConnector } from "../../WorkerConnector";
import { IWorkerCompiler } from "../IWorkerCompiler";

/**
 * @internal
 */
export async function ThreadWorker(): Promise<IWorkerCompiler.Creator> {
  const { Worker } = await NodeModule.thread.get();
  class ThreadWorker {
    private readonly worker_: thread.Worker;

    public constructor(
      jsFile: string,
      arg?: Partial<WorkerConnector.IConnectOptions>,
    ) {
      this.worker_ = new Worker(jsFile, {
        execArgv: arg?.execArgv,
      });
    }

    public terminate(): void {
      this.worker_.terminate().catch(() => {});
    }

    public set onmessage(listener: (event: MessageEvent) => void) {
      this.worker_.on("message", (value) => {
        listener({ data: value } as MessageEvent);
      });
    }

    public postMessage(message: any): void {
      this.worker_.postMessage(message);
    }
  }
  return (<any>ThreadWorker) as IWorkerCompiler.Creator;
}
