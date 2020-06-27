import { WorkerServer } from "../../../../../protocols/workers/module";
import { Statistics } from "../../../../providers/Calculator";

async function main(): Promise<void>
{
    let server: WorkerServer<{}, Statistics> = new WorkerServer();
    await server.open(new Statistics());
}
main();