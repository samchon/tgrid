//================================================================
/** @module tgrid.protocols.workers */
//================================================================
import { NodeModule } from "../../../../utils/internal/NodeModule";

/**
 * @hidden
 */
export async function ThreadPort() {
  const { parentPort } = await NodeModule.thread.get();
  const process = NodeModule.process();
  return {
    postMessage: (message: any) => parentPort!.postMessage(message),
    close: () => process.exit(0),
    onmessage: (listener: (event: MessageEvent) => void) =>
      parentPort!.on("message", (message) =>
        listener({ data: message } as MessageEvent),
      ),
    document: parentPort
      ? (null! as Document) // NOT WORKER
      : undefined,
    is_worker_server: () => !!parentPort,
  };
}
