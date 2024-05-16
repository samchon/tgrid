import { Driver, WorkerServer } from "tgrid";

import { ICalcConfig } from "../interfaces/ICalcConfig";
import { ICalcEventListener } from "../interfaces/ICalcEventListener";
import { CompositeCalculator } from "../providers/CompositeCalculator";

const main = async () => {
  const server: WorkerServer<
    ICalcConfig,
    CompositeCalculator,
    ICalcEventListener
  > = new WorkerServer();

  const header: ICalcConfig = await server.getHeader();
  const listener: Driver<ICalcEventListener> = server.getDriver();
  const provider: CompositeCalculator = new CompositeCalculator(
    header,
    listener,
  );
  await server.open(provider);
};
main().catch((exp) => {
  console.error(exp);
  process.exit(-1);
});
