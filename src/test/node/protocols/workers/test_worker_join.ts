import { WorkerConnector } from "../../../../protocols/workers";

import { FileSystem } from "../../../../protocols/workers/internal/FileSystem";
import { sleep_for } from "tstl/thread";

const FILE_PATH = __dirname + "/log.dat";

export async function test_worker_join(): Promise<void>
{
    await FileSystem.write(FILE_PATH, "NOT YET");

    let connector: WorkerConnector<{}, null> = new WorkerConnector(null);
    await connector.connect(__dirname + "/internal/join.js", {});

    sleep_for(100).then(() => connector.close());
    await connector.join();

    let content: string = await FileSystem.read(FILE_PATH, "utf8");
    await FileSystem.unlink(FILE_PATH);
    
    if (content !== "WorkerServer.join()")
        throw new Error("Error on WorkerServer.join()");
}