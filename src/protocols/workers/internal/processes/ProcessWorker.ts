import type cp from "child_process";

import { NodeModule } from "../../../../utils/internal/NodeModule";
import { IWorkerCompiler } from "../IWorkerCompiler";

/**
 * @internal
 */
export async function ProcessWorker(): Promise<IWorkerCompiler.Creator> {
  const { fork } = await NodeModule.cp.get();

  class ProcessWorker {
    private process_: cp.ChildProcess;

    public constructor(jsFile: string, execArgv: string[] | undefined) {
      this.process_ = fork(jsFile, { execArgv });
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
