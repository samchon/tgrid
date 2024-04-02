//================================================================

/** @module tgrid.protocols.workers */
//================================================================
import { NodeModule } from "../../../../utils/internal/NodeModule";

/**
 * @hidden
 */

export async function ThreadPort() {
  const { parentPort } = await NodeModule.thread.get();
  if (!parentPort) throw new Error("This is not a worker thread.");

  const process = NodeModule.process.get();
  class ThreadPort {
    public static postMessage(message: any): void {
      parentPort!.postMessage(message);
    }
    public static close(): void {
      process.exit(0);
    }
    public static set onmessage(listener: (event: MessageEvent) => void) {
      parentPort!.on("message", (msg) => {
        listener({ data: msg } as MessageEvent);
      });
    }
    public static get document(): Document {
      return null!;
    }
    public static is_worker_server(): boolean {
      return true;
    }
  }
  return ThreadPort;
}
export namespace ThreadPort {
  export async function isWorkerThread(): Promise<boolean> {
    const { parentPort } = await NodeModule.thread.get();
    return !!parentPort;
  }
}
