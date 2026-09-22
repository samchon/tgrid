import http from "http";
import https from "https";
import ws from "ws";

import { IPlatform } from "../IPlatform";
import { NodeWorkerChannel } from "./NodeWorkerChannel";
import { NodeWorkerCompiler } from "./NodeWorkerCompiler";

/**
 * Platform features for the NodeJS.
 *
 * @internal
 */
export const Platform: IPlatform = {
  name: "node",
  web: {
    createSocket: (url) => new ws(url) as any,
    createServer: (options) =>
      options !== null ? https.createServer(options) : http.createServer(),
    createProtocol: () => new ws.Server({ noServer: true }),
  },
  worker: {
    compiler: (type) => NodeWorkerCompiler(type ?? "process"),
    channel: () => NodeWorkerChannel(),
  },
};
