import cp from "child_process";

import { WorkerConnector } from "../../protocols/workers/WorkerConnector";

/**
 * `Worker` implemented by the `child_process.fork()`.
 *
 * @internal
 */
export class ProcessWorker {
  private readonly process_: cp.ChildProcess;

  public constructor(
    jsFile: string,
    options?: Partial<WorkerConnector.IConnectOptions>,
  ) {
    this.process_ = cp.fork(jsFile, {
      execArgv: options?.execArgv,
      stdio: options?.stdio,
      cwd: options?.cwd,
      ...(options?.env ? { env: options.env } : {}),
    });
  }

  public terminate(): void {
    this.process_.kill();
  }

  public set onmessage(listener: (event: MessageEvent) => void) {
    this.process_.on("message", (message) => {
      listener({ data: message } as MessageEvent);
    });
  }

  public postMessage(message: any): void {
    this.process_.send(message);
  }
}
