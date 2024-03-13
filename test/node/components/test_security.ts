import { Driver, WebConnector, WebServer } from "tgrid";

import { Calculator, Scientific } from "../../providers/Calculator";

class CustomCalculator extends Calculator {
  public _scientific = new Scientific();

  public multiplies_(x: number, y: number): number {
    return x * y;
  }
}

async function must_be_error(
  procedures: (() => Promise<void>)[],
): Promise<void> {
  let count: number = 0;
  for (const proc of procedures)
    try {
      await proc();
    } catch (exp) {
      ++count;
    }
  if (count !== procedures.length) throw new Error("Must be security error");
}

export async function test_security(): Promise<void> {
  const server: WebServer<object, CustomCalculator> = new WebServer();
  await server.open(10101, async (acceptor) => {
    await acceptor.accept(new CustomCalculator());
  });

  const connector: WebConnector<null, null> = new WebConnector(null, null);
  await connector.connect("ws://127.0.0.1:10101");

  const calc: Driver<CustomCalculator> = connector.getDriver();
  await must_be_error([
    () => (calc.plus as any).toString(),
    () => (calc as any).prototype.toString(),
    // () => calc._scientific.log(2, 16),
    // () => calc.multiplies_(4, 5),
    () => (calc.scientific as any).constructor.toString(),
    () => (calc.statistics.mean as any).prototype.minus(7, 4),
  ]);

  await connector.close();
  await server.close();
}
