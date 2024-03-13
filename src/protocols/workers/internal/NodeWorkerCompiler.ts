import { v4 } from "uuid";
import { NodeModule } from "../../../utils/internal/NodeModule";

import { FileSystem } from "./FileSystem";
import { IWorkerCompiler } from "./IWorkerCompiler";
import { ProcessWorker } from "./processes/ProcessWorker";
import { ThreadWorker } from "./threads/ThreadWorker";

/**
 * @hidden
 */
export const NodeWorkerCompiler = async (
  type: "process" | "thread",
): Promise<IWorkerCompiler> => ({
  execute: async (jsFile, execArg) => {
    const factory =
      type === "process" ? await ProcessWorker() : await ThreadWorker();
    return (<any>new factory(jsFile, execArg)) as Worker;
  },
  compile: async (content) => {
    const os = await NodeModule.os.get();
    let path: string = `${os.tmpdir().split("\\").join("/")}/tgrid`;
    if ((await FileSystem.exists(path)) === false) await FileSystem.mkdir(path);

    while (true) {
      const myPath: string = `${path}/${v4()}.js`;
      if ((await FileSystem.exists(myPath)) === false) {
        path = myPath;
        break;
      }
    }

    await FileSystem.write(path, content);
    return path;
  },
  remove: async (url) => {
    try {
      await FileSystem.unlink(url);
    } catch {}
  },
  // public execute(jsFile: string, execArgv: string[] | undefined): Worker
  // {
  //     return new this.factory_(jsFile, execArgv) as any;
  // }
});
