import { SharedWorkerServer } from "../../protocols/workers/module";
import { Calculator } from "../providers/Calculator";

/// chrome://inspect/#workers
async function main(): Promise<void>
{
    let server: SharedWorkerServer<{}, Calculator> = new SharedWorkerServer();
    await server.open(async acceptor =>
    {
        console.log(acceptor.headers);
        await acceptor.accept(new Calculator());
    });
}
main();