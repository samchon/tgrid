import { NodeModule } from "../../../../utils/internal/NodeModule";

/**
 * @hidden
 */
export class ProcessChannel {
  public static postMessage(message: any): void {
    NodeModule.process().send!(message);
  }

  public static close(): void {
    NodeModule.process().exit();
  }

  public static set onmessage(listener: (event: MessageEvent) => void) {
    NodeModule.process().on("message", (msg) => {
      listener({ data: msg } as MessageEvent);
    });
  }

  public static is_worker_server(): boolean {
    return !!NodeModule.process().send;
  }
}
