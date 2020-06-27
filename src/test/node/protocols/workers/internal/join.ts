import fs from "fs";
import { WorkerServer } from "../../../../../protocols/workers/WorkerServer";

const FILE_PATH = __dirname + "/../log.dat";

async function main(): Promise<void>
{
    let server: WorkerServer<null, null> = new WorkerServer();
    await server.open(null);
    await server.join();
    
    fs.writeFileSync(FILE_PATH, "WorkerServer.join()", "utf8");
}
main();