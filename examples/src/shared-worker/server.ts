import { Driver, SharedWorkerAcceptor, SharedWorkerServer } from "tgrid";

import { ICalcConfig } from "../interfaces/ICalcConfig";
import { ICalcEventListener } from "../interfaces/ICalcEventListener";
import { CompositeCalculator } from "../providers/CompositeCalculator";

const main = async () => {
  let pool: number = 0;
  const server: SharedWorkerServer<
    ICalcConfig,
    CompositeCalculator,
    ICalcEventListener
  > = new SharedWorkerServer();
  await server.open(
    async (
      acceptor: SharedWorkerAcceptor<
        ICalcConfig,
        CompositeCalculator,
        ICalcEventListener
      >,
    ) => {
      // LIST UP PROPERTIES
      const config: ICalcConfig = acceptor.header;
      const listener: Driver<ICalcEventListener> = acceptor.getDriver();

      // ACCEPT OR REJECT THE CONNECTION
      if (pool >= 8) {
        await acceptor.reject("Too much connections.");
      } else {
        await acceptor.accept(new CompositeCalculator(config, listener));
        ++pool;
        await acceptor.join();
        --pool;
      }
    },
  );
};
main().catch((exp) => {
  console.error(exp);
  process.exit(-1);
});
