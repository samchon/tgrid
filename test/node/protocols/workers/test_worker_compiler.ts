import fs from "fs";
import { WorkerConnector } from "tgrid";

import { TestBundler } from "../../../browser/TestBundler";
import { ICalculator } from "../../../controllers/ICalculator";

export async function test_worker_compiler(): Promise<void> {
  const PATH = __dirname + "/../../../../../bundle/worker-server.js";
  if (fs.existsSync(PATH) === false) await TestBundler.execute();

  await _Test_worker(
    (worker) => worker.compile(fs.readFileSync(PATH, "utf8")),
    "process",
  );
}

async function _Test_worker(
  connect: (obj: WorkerConnector<null, null>) => Promise<void>,
  type: "thread" | "process",
): Promise<void> {
  const worker: WorkerConnector<null, null> = new WorkerConnector(
    null,
    null,
    type,
  );

  // TEST RE-USABILITY
  for (let i: number = 0; i < 5; ++i) {
    await connect(worker);
    await ICalculator.main(worker.getDriver<ICalculator>());
    await worker.close();
  }
}
