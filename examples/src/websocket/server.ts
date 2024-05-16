import { Driver, WebSocketAcceptor, WebSocketServer } from "tgrid";

import { ICalcConfig } from "../interfaces/ICalcConfig";
import { ICalcEventListener } from "../interfaces/ICalcEventListener";
import { CompositeCalculator } from "../providers/CompositeCalculator";
import { ScientificCalculator } from "../providers/ScientificCalculator";
import { SimpleCalculator } from "../providers/SimpleCalculator";
import { StatisticsCalculator } from "../providers/StatisticsCalculator";

export const webSocketServerMain = async () => {
  const server: WebSocketServer<
    ICalcConfig,
    | CompositeCalculator
    | SimpleCalculator
    | StatisticsCalculator
    | ScientificCalculator,
    ICalcEventListener
  > = new WebSocketServer();
  await server.open(
    37_000,
    async (
      acceptor: WebSocketAcceptor<
        ICalcConfig,
        | CompositeCalculator
        | SimpleCalculator
        | StatisticsCalculator
        | ScientificCalculator,
        ICalcEventListener
      >,
    ) => {
      // LIST UP PROPERTIES
      const config: ICalcConfig = acceptor.header;
      const listener: Driver<ICalcEventListener> = acceptor.getDriver();

      // ACCEPT OR REJECT
      if (acceptor.path === "/composite")
        await acceptor.accept(new CompositeCalculator(config, listener));
      else if (acceptor.path === "/simple")
        await acceptor.accept(new SimpleCalculator(config, listener));
      else if (acceptor.path === "/statistics")
        await acceptor.accept(new StatisticsCalculator(config, listener));
      else if (acceptor.path === "/scientific")
        await acceptor.accept(new ScientificCalculator(config, listener));
      else await acceptor.reject(1002, `WebSocket API endpoint not found.`);
    },
  );
  return server;
};
