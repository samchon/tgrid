import { WorkerServer } from "../../../../../protocols/workers/module";
import { Scientific } from "../../../../providers/Calculator";

async function main(): Promise<void>
{
    const server: WorkerServer<{}, Scientific> = new WorkerServer();
    await server.open(new Scientific());
}
main();