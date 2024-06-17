import { Driver, WorkerConnector } from "tgrid";

import { IScientific } from "../../../controllers/ICalculator";

export async function test_worker_stdio(): Promise<void> {
  const connector = new WorkerConnector(null, null, "process");
  await connector.connect(`${__dirname}/internal/loud.js`, {
    stdio: "ignore",
  });

  const driver: Driver<IScientific> = connector.getDriver<IScientific>();
  await driver.pow(2, 4);
  await driver.sqrt(16);

  await connector.close();
}
