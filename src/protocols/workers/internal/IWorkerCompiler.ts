import { WorkerConnector } from "../WorkerConnector";

/**
 * @internal
 */
export interface IWorkerCompiler {
  compile(content: string): Promise<string>;
  remove(path: string): Promise<void>;
  execute(
    jsFile: string,
    options?: Partial<WorkerConnector.IConnectOptions>,
  ): Promise<Worker>;
}
