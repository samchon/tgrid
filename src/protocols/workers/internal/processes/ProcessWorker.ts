import type cp from "child_process";

import { NodeModule } from "../../../../utils/internal/NodeModule";
import { WorkerConnector } from "../../WorkerConnector";
import { IWorkerCompiler } from "../IWorkerCompiler";

/**
 * @internal
 */
export async function ProcessWorker(): Promise<IWorkerCompiler.Creator> {
  const { fork } = await NodeModule.cp.get();

  class ProcessWorker {
    private process_: cp.ChildProcess;

    public constructor(
      jsFile: string,
      options?: Partial<WorkerConnector.IConnectOptions>,
    ) {
      this.process_ = fork(jsFile, {
        execArgv: options?.execArgv,
        stdio: options?.stdio,
        cwd: options?.cwd,
        env: options?.env,
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
  return (<any>ProcessWorker) as IWorkerCompiler.Creator;
}
