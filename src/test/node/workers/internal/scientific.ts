import { WorkerServer } from "../../../../protocols/workers";
import { Scientific } from "../../../providers/Calculator";

async function main(): Promise<void>
{
    let server = new WorkerServer();
    await server.open(new Scientific());
}
main();