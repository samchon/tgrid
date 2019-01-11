import { WorkerServer } from "../../../../protocols/workers";
import { Statistics } from "../../../internal/Calculator";

async function main(): Promise<void>
{
    let server = new WorkerServer();
    await server.open(new Statistics());
}
main();