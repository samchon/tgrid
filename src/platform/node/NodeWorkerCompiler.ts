import os from "os";

import { IWorkerCompiler } from "../../protocols/workers/internal/IWorkerCompiler";
import { FileSystem } from "./FileSystem";
import { ProcessWorker } from "./ProcessWorker";
import { ThreadWorker } from "./ThreadWorker";

/**
 * @internal
 */
export const NodeWorkerCompiler = (
  type: "process" | "thread",
): IWorkerCompiler => ({
  execute: async (jsFile, options) => {
    const factory = type === "process" ? ProcessWorker : ThreadWorker;
    return (<any>new factory(jsFile, options)) as Worker;
  },
  compile: async (content) => {
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
});

/**
 * @internal
 */
const uuid = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
