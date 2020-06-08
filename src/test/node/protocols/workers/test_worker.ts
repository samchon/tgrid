import { WorkerConnector } from "../../../../protocols/workers";
import { IScientific } from "../../../controllers/ICalculator";

export async function test_worker(): Promise<void>
{
    let worker: WorkerConnector<{}, null> = new WorkerConnector(null);
    await worker.connect(__dirname + "/internal/scientific.js", {});

    if (await worker.getDriver<IScientific>().pow(2, 4) !== Math.pow(2, 4))
        throw new Error("Unknown error on worker");
    await worker.close();
}