import { WebSocketRoute } from "@nestia/core";
import { Controller } from "@nestjs/common";
import { Driver, WebSocketAcceptor } from "tgrid";

import { ICalcConfig } from "../interfaces/ICalcConfig";
import { ICalcEventListener } from "../interfaces/ICalcEventListener";
import { ICompositeCalculator } from "../interfaces/ICompositeCalculator";
import { IScientificCalculator } from "../interfaces/IScientificCalculator";
import { ISimpleCalculator } from "../interfaces/ISimpleCalculator";
import { IStatisticsCalculator } from "../interfaces/IStatisticsCalculator";
import { CompositeCalculator } from "../providers/CompositeCalculator";
import { ScientificCalculator } from "../providers/ScientificCalculator";
import { SimpleCalculator } from "../providers/SimpleCalculator";
import { StatisticsCalculator } from "../providers/StatisticsCalculator";

@Controller("calculate")
export class CalculateController {
  /**
   * Prepare a composite calculator.
   */
  @WebSocketRoute("composite")
  public async composite(
    @WebSocketRoute.Acceptor()
    acceptor: WebSocketAcceptor<
      ICalcConfig,
      ICompositeCalculator,
      ICalcEventListener
    >,
    @WebSocketRoute.Header() header: ICalcConfig,
    @WebSocketRoute.Driver() listener: Driver<ICalcEventListener>,
  ): Promise<void> {
    const provider: CompositeCalculator = new CompositeCalculator(
      header,
      listener,
    );
    await acceptor.accept(provider);
  }

  /**
   * Prepare a simple calculator.
   */
  @WebSocketRoute("simple")
  public async simple(
    @WebSocketRoute.Acceptor()
    acceptor: WebSocketAcceptor<
      ICalcConfig, // header
      ISimpleCalculator, // provider for remote client
      ICalcEventListener // provider from remote client
    >,
  ): Promise<void> {
    const header: ICalcConfig = acceptor.header;
    const listener: Driver<ICalcEventListener> = acceptor.getDriver();
    const provider: SimpleCalculator = new SimpleCalculator(header, listener);
    await acceptor.accept(provider);
  }

  /**
   * Prepare a scientific calculator.
   */
  @WebSocketRoute("scientific")
  public async scientific(
    @WebSocketRoute.Acceptor()
    acceptor: WebSocketAcceptor<
      ICalcConfig,
      IScientificCalculator,
      ICalcEventListener
    >,
  ): Promise<void> {
    const header: ICalcConfig = acceptor.header;
    const listener: Driver<ICalcEventListener> = acceptor.getDriver();
    const provider: ScientificCalculator = new ScientificCalculator(
      header,
      listener,
    );
    await acceptor.accept(provider);
  }

  /**
   * Prepare a statistics calculator.
   */
  @WebSocketRoute("statistics")
  public async statistics(
    @WebSocketRoute.Acceptor()
    acceptor: WebSocketAcceptor<
      ICalcConfig,
      IStatisticsCalculator,
      ICalcEventListener
    >,
  ): Promise<void> {
    const header: ICalcConfig = acceptor.header;
    const listener: Driver<ICalcEventListener> = acceptor.getDriver();
    const provider: IStatisticsCalculator = new StatisticsCalculator(
      header,
      listener,
    );
    await acceptor.accept(provider);
  }
}
