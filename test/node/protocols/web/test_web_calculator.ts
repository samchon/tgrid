import { Driver, WebSocketConnector, WebSocketServer } from "tgrid";
import { Vector } from "tstl";

import { ICalculator } from "../../../controllers/ICalculator";
import { IVector } from "../../../controllers/IVector";
import { Calculator } from "../../../providers/Calculator";

const PORT: number = 10101;

export async function test_web_calculator(): Promise<void> {
  //----
  // SERVER
  //----
  const server: WebSocketServer<object, Calculator | Vector<number>, null> =
    new WebSocketServer();
  await server.open(PORT, async (acceptor) => {
    // SPECIFY PROVIDER
    const provider = /calculator/.test(acceptor.path)
      ? new Calculator()
      : new Vector<number>();

    // ALLOW CONNECTION
    await acceptor.accept(provider);
  });

  //----
  // CLIENTS
  //----
  const connector: WebSocketConnector<
    null,
    null,
    ICalculator | IVector<number>
  > = new WebSocketConnector(null, null);

  // const RE-USABILITY
  for (const path of ["calculator", "vector"])
    for (let i: number = 0; i < 3; ++i) {
      // DO CONNECT
      await connector.connect(`ws://127.0.0.1:${PORT}/${path}`);

      // SET DRIVER AND TEST BY CALCULATOR PROCESS
      if (path === "calculator") {
        const driver: Driver<ICalculator> = connector.getDriver();
        await ICalculator.main(driver);
      } else {
        const driver: Driver<IVector<number>> = connector.getDriver();
        await IVector.main(driver);
      }
      await connector.close();
    }

  // CLOSE SERVER
  await server.close();
}
