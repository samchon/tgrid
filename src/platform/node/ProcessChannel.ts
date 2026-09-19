import { IWorkerChannel } from "../../protocols/workers/internal/IWorkerChannel";

/**
 * Channel from a child process (`child_process.fork()`) to its parent.
 *
 * @internal
 */
export const ProcessChannel = (): IWorkerChannel => ({
  postMessage: (message) => process.send!(message),
  close: () => process.exit(),
  set onmessage(listener: (event: MessageEvent) => void) {
    process.on("message", (msg) => {
      listener({ data: msg } as MessageEvent);
    });
  },
  is_worker_server: () => !!process.send,
});
