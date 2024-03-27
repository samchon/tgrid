import { Driver, WorkerConnector } from "tgrid";
import { ICalculator } from "../../../controllers/ICalculator";

export async function test_hierarchical_workers(): Promise<void> {
  const connector: WorkerConnector<null, null> = new WorkerConnector(
    null,
    null,
    "process",
  );
  for (let i: number = 0; i < 5; ++i) {
    // DO CONNECT
    await connector.connect(__dirname + "/internal/calculator.js");

    // DO TEST
    const driver: Driver<ICalculator> = connector.getDriver<ICalculator>();
    await ICalculator.main(driver);

    // TERMINATE
    await connector.close();
  }
}
