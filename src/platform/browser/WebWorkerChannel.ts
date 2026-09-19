import { IWorkerChannel } from "../../protocols/workers/internal/IWorkerChannel";

/**
 * @internal
 */
export const WebWorkerChannel = (): IWorkerChannel => ({
  close: () => self.close(),
  postMessage: (message) => self.postMessage(message),
  set onmessage(listener: (event: MessageEvent) => void) {
    self.onmessage = listener;
  },
  is_worker_server: () => self.document === undefined,
});
