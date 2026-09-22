import { Driver, WorkerConnector } from "tgrid";

import { ICalculator } from "../../../controllers/ICalculator";
import { resolve_runtime_path } from "../../runtime";

export async function test_hierarchical_workers(): Promise<void> {
  const connector: WorkerConnector<null, null, ICalculator> =
    new WorkerConnector(null, null, "process");
  for (let i: number = 0; i < 5; ++i) {
    // DO CONNECT
    await connector.connect(
      resolve_runtime_path(__dirname + "/internal/calculator.ts"),
    );

    // DO TEST
    const driver: Driver<ICalculator> = connector.getDriver();
    await ICalculator.main(driver);

    // TERMINATE
    await connector.close();
  }
}
