import { NodeModule } from "../../../../utils/internal/NodeModule";

/**
 * @hidden
 */
export class ProcessChannel {
  public static postMessage(message: any): void {
    NodeModule.process.get().send!(message);
  }

  public static close(): void {
    NodeModule.process.get().exit();
  }

  public static set onmessage(listener: (event: MessageEvent) => void) {
    NodeModule.process.get().on("message", (msg) => {
      listener({ data: msg } as MessageEvent);
    });
  }

  public static is_worker_server(): boolean {
    return !!NodeModule.process.get().send;
  }
}
