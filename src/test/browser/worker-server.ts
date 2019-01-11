import { WorkerServer } from "../../protocols/workers/WorkerServer";
import { Calculator } from "../internal/Calculator";

async function main(): Promise<void>
{
    let server = new WorkerServer();
    await server.open(new Calculator());
}
main();