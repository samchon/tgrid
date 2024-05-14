import { Driver, WorkerConnector } from "tgrid";

import { ICalcConfig } from "../interfaces/ICalcConfig";
import { ICalcEvent } from "../interfaces/ICalcEvent";
import { ICalcEventListener } from "../interfaces/ICalcEventListener";
import { ICompositeCalculator } from "../interfaces/ICompositeCalculator";

const EXTENSION = __filename.endsWith(".ts") ? "ts" : "js";

export const workerClientMain = async () => {
  const stack: ICalcEvent[] = [];
  const listener: ICalcEventListener = {
    on: (evt: ICalcEvent) => stack.push(evt),
  };
  const connector: WorkerConnector<
    ICalcConfig,
    ICalcEventListener,
    ICompositeCalculator
  > = new WorkerConnector(
    { precision: 2 }, // header
    listener, // provider for remote server
    "process",
  );
  await connector.connect(`${__dirname}/server.${EXTENSION}`);

  const remote: Driver<ICompositeCalculator> = connector.getDriver();
  await remote.plus(10, 20); // returns 30
  await remote.multiplies(3, 4); // returns 12
  await remote.divides(5, 3); // returns 1.67
  await remote.scientific.sqrt(2); // returns 1.41
  await remote.statistics.mean(1, 3, 9); // returns 4.33

  await connector.close();
  console.log(stack);
};
