import type http from "http";
import type https from "https";
import type ws from "ws";

import type { IWorkerChannel } from "../protocols/workers/internal/IWorkerChannel";
import type { IWorkerCompiler } from "../protocols/workers/internal/IWorkerCompiler";

/**
 * Runtime platform dependent features.
 *
 * TGrid has two implementations of this interface; one for the NodeJS
 * (`src/platform/node`) and the other for the web browser
 * (`src/platform/browser`). Which one to be used is decided at the build
 * time by the `#platform` path alias (`tsconfig.node.json` and
 * `tsconfig.browser.json`), so that the browser build never references
 * NodeJS only modules like `ws`, `http` or `worker_threads`.
 *
 * @internal
 */
export interface IPlatform {
  /**
   * Name of the platform.
   */
  readonly name: "node" | "browser";

  /**
   * Features for the websocket protocol.
   */
  readonly web: IPlatform.IWeb;

  /**
   * Features for the worker protocol.
   */
  readonly worker: IPlatform.IWorker;
}

/**
 * @internal
 */
export namespace IPlatform {
  export interface IWeb {
    /**
     * Create a websocket client connecting to the `url`.
     */
    createSocket(url: string): WebSocket;

    /**
     * Create an HTTP(S) server to be upgraded to the websocket protocol.
     *
     * Available only in the NodeJS.
     */
    createServer(
      options: https.ServerOptions | null,
    ): http.Server | https.Server;

    /**
     * Create a websocket protocol handler upgrading HTTP(S) connections.
     *
     * Available only in the NodeJS.
     */
    createProtocol(): ws.Server;
  }

  export interface IWorker {
    /**
     * Get compiler creating worker instances.
     *
     * @param type Worker mode, only meaningful in the NodeJS.
     */
    compiler(type?: "process" | "thread"): IWorkerCompiler;

    /**
     * Get communication channel to the parent of current worker.
     */
    channel(): IWorkerChannel;
  }
}
