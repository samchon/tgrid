import { WorkerConnector } from "tgrid";

import { IScientific } from "../../../controllers/ICalculator";

export async function test_worker(): Promise<void> {
  const worker: WorkerConnector<null, null> = new WorkerConnector(null, null);
  await worker.connect(__dirname + "/internal/scientific.js");

  if ((await worker.getDriver<IScientific>().pow(2, 4)) !== Math.pow(2, 4))
    throw new Error("Unknown error on worker");
  await worker.close();
}
