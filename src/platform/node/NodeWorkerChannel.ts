import { parentPort } from "worker_threads";

import { IWorkerChannel } from "../../protocols/workers/internal/IWorkerChannel";
import { ProcessChannel } from "./ProcessChannel";
import { ThreadChannel } from "./ThreadChannel";

/**
 * @internal
 */
export const NodeWorkerChannel = (): IWorkerChannel =>
  parentPort !== null ? ThreadChannel(parentPort) : ProcessChannel();
