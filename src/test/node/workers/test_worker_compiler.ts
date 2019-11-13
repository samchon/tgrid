import fs = require("fs");
import cp = require("child_process");

import { WorkerConnector } from "../../../protocols/workers/WorkerConnector";
import { ICalculator } from "../../controllers/ICalculator";

export function test_worker_connect(): Promise<void>
{
    return _Test_worker(worker =>
    {
        return worker.connect(__dirname + "/../../browser/worker-server.js", "first", "second");
    });
}

export async function test_worker_compile(): Promise<void>
{
    const PATH = __dirname + "/../../../bundle/worker-server.js";
    if (fs.existsSync(PATH) === false)
        cp.execSync("npm run bundle");

    await _Test_worker(worker =>
    {
        return worker.compile(fs.readFileSync(PATH, "utf8"), "first", "second");
    });
}

async function _Test_worker(connect: (obj: WorkerConnector)=>Promise<void>): Promise<void>
{
    let worker = new WorkerConnector();

    // TEST RE-USABILITY
    for (let i: number = 0; i < 5; ++i)
    {
        await connect(worker);
        await ICalculator.main(worker.getDriver<ICalculator>());
        await worker.close();
    }
}