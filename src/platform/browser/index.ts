import { WebWorkerCompiler } from "../../protocols/workers/internal/WebWorkerCompiler";
import { IPlatform } from "../IPlatform";
import { WebWorkerChannel } from "./WebWorkerChannel";

/**
 * Platform features for the web browser.
 *
 * @internal
 */
export const Platform: IPlatform = {
  name: "browser",
  web: {
    createSocket: (url) => new WebSocket(url),
    createServer: () => {
      throw new Error(
        "Error on WebSocketServer.open(): only available in NodeJS.",
      );
    },
    createProtocol: () => {
      throw new Error(
        "Error on WebSocketServer.open(): only available in NodeJS.",
      );
    },
  },
  worker: {
    compiler: () => WebWorkerCompiler(),
    channel: () => WebWorkerChannel(),
  },
};
