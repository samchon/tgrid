import fs from "fs";
import cp from "child_process";

import { WorkerConnector } from "../../../../protocols/workers/WorkerConnector";
import { ICalculator } from "../../../controllers/ICalculator";

export function test_worker_connect(): Promise<void>
{
    return _Test_worker
    (
        worker => worker.connect(__dirname + "/../../../browser/worker-server.js"),
        "process"
    );
}

export async function test_worker_compile(): Promise<void>
{
    const PATH = __dirname + "/../../../../../bundle/worker-server.js";
    if (fs.existsSync(PATH) === false)
        cp.execSync("npm run bundle");

    await _Test_worker
    (
        worker => worker.compile(fs.readFileSync(PATH, "utf8")),
        "thread"
    );
}

async function _Test_worker
    (
        connect: (obj: WorkerConnector<null, null>) => Promise<void>,
        type: "thread" | "process"
    ): Promise<void>
{
    const worker: WorkerConnector<null, null> = new WorkerConnector(null, null, type);

    // TEST RE-USABILITY
    for (let i: number = 0; i < 5; ++i)
    {
        await connect(worker);
        await ICalculator.main(worker.getDriver<ICalculator>());
        await worker.close();
    }
}