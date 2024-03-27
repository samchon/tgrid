import fs from "fs";
import cp from "child_process";

import { ICalculator } from "../../../controllers/ICalculator";
import { WorkerConnector } from "tgrid";

export async function test_worker_compiler(): Promise<void> {
  const PATH = __dirname + "/../../../../../bundle/worker-server.js";
  if (fs.existsSync(PATH) === false) cp.execSync("npm run bundle");

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
