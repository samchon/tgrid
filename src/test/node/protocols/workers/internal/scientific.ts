import { WorkerServer } from "../../../../../protocols/workers";
import { Scientific } from "../../../../providers/Calculator";

async function main(): Promise<void>
{
    let server: WorkerServer<{}, Scientific> = new WorkerServer();
    await server.open(new Scientific());
}
main();