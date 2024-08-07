import { Driver, WorkerConnector, WorkerServer } from "tgrid";

import { IScientific, IStatistics } from "../../../../controllers/ICalculator";
import { Simple } from "../../../../providers/Calculator";

class HierarchicalCalculator extends Simple {
  // REMOTE CALCULATOR
  public scientific!: Driver<IScientific>;
  public statistics!: Driver<IStatistics>;
}

async function get<Controller extends object>(
  path: string,
): Promise<Driver<Controller>> {
  // DO CONNECT
  const connector: WorkerConnector<null, null, Controller> =
    new WorkerConnector(null, null, "process");
  await connector.connect(path);

  // RETURN DRIVER
  return connector.getDriver();
}

async function main(): Promise<void> {
  // PREPARE REMOTE CALCULATOR
  const calc = new HierarchicalCalculator();
  calc.scientific = await get<IScientific>(__dirname + "/scientific.js");
  calc.statistics = await get<IStatistics>(__dirname + "/statistics.js");

  // OPEN SERVER
  const server = new WorkerServer();
  await server.open(calc);
}
main().catch((exp) => {
  console.log(exp);
  process.exit(-1);
});
