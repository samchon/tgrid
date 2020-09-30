import { WorkerServer } from "../../protocols/workers/WorkerServer";
import { Calculator } from "../providers/Calculator";

async function main(): Promise<void>
{
    const server: WorkerServer<{}, Calculator> = new WorkerServer();
    await server.open(new Calculator());
}
main();