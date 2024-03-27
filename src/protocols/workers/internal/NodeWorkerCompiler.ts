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
      const myPath: string = `${path}/${uuid()}.js`;
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

const uuid = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
