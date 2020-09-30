import { WorkerServer } from "../../../../../protocols/workers/module";
import { Statistics } from "../../../../providers/Calculator";

async function main(): Promise<void>
{
    const server: WorkerServer<{}, Statistics> = new WorkerServer();
    await server.open(new Statistics());
}
main();