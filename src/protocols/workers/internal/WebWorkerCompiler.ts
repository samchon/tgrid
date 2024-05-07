import { IWorkerCompiler } from "./IWorkerCompiler";

/**
 * @internal
 */
export const WebWorkerCompiler = async (): Promise<IWorkerCompiler> => ({
  compile: async (content) => {
    const blob: Blob = new Blob([content], {
      type: "application/javascript",
    });
    return self.URL.createObjectURL(blob);
  },
  remove: async (url) => {
    // THE FILE CAN BE REMOVED BY BROWSER AUTOMATICALLY
    try {
      self.URL.revokeObjectURL(url);
    } catch {}
  },
  execute: async (jsFile) => new Worker(jsFile),
});
