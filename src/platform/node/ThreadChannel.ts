import type { MessagePort } from "worker_threads";

import { IWorkerChannel } from "../../protocols/workers/internal/IWorkerChannel";

/**
 * Channel from a worker thread (`worker_threads.Worker`) to its parent.
 *
 * @internal
 */
export const ThreadChannel = (parentPort: MessagePort): IWorkerChannel => ({
  postMessage: (message) => parentPort.postMessage(message),
  close: () => process.exit(0),
  set onmessage(listener: (event: MessageEvent) => void) {
    parentPort.on("message", (msg) => {
      listener({ data: msg } as MessageEvent);
    });
  },
  is_worker_server: () => true,
});
