import { Driver, WorkerConnector } from "tgrid";

import { IScientific } from "../../../controllers/ICalculator";
import { resolve_runtime_path } from "../../runtime";

export async function test_worker_stdio(): Promise<void> {
  const connector = new WorkerConnector(null, null, "process");
  await connector.connect(
    resolve_runtime_path(`${__dirname}/internal/loud.ts`),
    {
      stdio: "ignore",
    },
  );

  const driver: Driver<IScientific> = connector.getDriver<IScientific>();
  await driver.pow(2, 4);
  await driver.sqrt(16);

  await connector.close();
}
