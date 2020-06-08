import { WorkerServer } from "../../protocols/workers/WorkerServer";
import { Calculator } from "../providers/Calculator";

async function main(): Promise<void>
{
    let server: WorkerServer<{}, Calculator> = new WorkerServer();
    await server.open(new Calculator());
}
main();