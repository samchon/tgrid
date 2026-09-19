import thread from "worker_threads";

import { WorkerConnector } from "../../protocols/workers/WorkerConnector";

/**
 * `Worker` implemented by the `worker_threads.Worker`.
 *
 * @internal
 */
export class ThreadWorker {
  private readonly worker_: thread.Worker;

  public constructor(
    jsFile: string,
    options?: Partial<WorkerConnector.IConnectOptions>,
  ) {
    this.worker_ = new thread.Worker(jsFile, {
      execArgv: options?.execArgv,
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
