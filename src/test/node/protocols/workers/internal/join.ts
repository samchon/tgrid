import fs = require("fs");
import { WorkerServer } from "../../../../../protocols/workers/WorkerServer";

const FILE_PATH = __dirname + "/../log.dat";

async function main(): Promise<void>
{
    let server: WorkerServer = new WorkerServer();
    await server.open();
    await server.join();
    
    fs.writeFileSync(FILE_PATH, "WorkerServer.join()", "utf8");
}
main();