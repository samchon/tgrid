/**
 * Communication channel from a worker to its parent.
 *
 * @internal
 */
export interface IWorkerChannel {
  close(): void;
  postMessage(message: any): void;
  onmessage: (event: MessageEvent) => void;
  is_worker_server(): boolean;
}
