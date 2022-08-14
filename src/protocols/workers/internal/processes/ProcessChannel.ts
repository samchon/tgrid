/**
 * @packageDocumentation
 * @module tgrid.protocols.workers
 */
//----------------------------------------------------------------
/**
 * @hidden
 */
export class ProcessChannel {
    public static postMessage(message: any): void {
        (global.process as Required<NodeJS.Process>).send(message);
    }

    public static close(): void {
        global.process.exit();
    }

    public static set onmessage(listener: (event: MessageEvent) => void) {
        global.process.on("message", (msg) => {
            listener({ data: msg } as MessageEvent);
        });
    }

    public static is_worker_server(): boolean {
        return !!global.process.send;
    }
}
