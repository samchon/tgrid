import {
  Driver,
  WebSocketAcceptor,
  WebSocketConnector,
  WebSocketServer,
} from "tgrid";

import { ICalculator } from "../../../controllers/ICalculator";
import { Calculator } from "../../../providers/Calculator";

const PORT: number = 10171;

export async function test_web_event(): Promise<void> {
  //----
  // HANDSHAKE
  //----
  const server: WebSocketServer<object, Calculator, null> =
    new WebSocketServer();
  let acceptor!: WebSocketAcceptor<object, Calculator, null>;
  await server.open(PORT, async (a) => {
    acceptor = a;
    acceptor.accept(new Calculator());
  });

  const connector: WebSocketConnector<null, null, ICalculator> =
    new WebSocketConnector(null, null);
  await connector.connect(`ws://127.0.0.1:${PORT}`);

  //----
  // EVENT LISTENERS
  //----
  connector.on("send", (event) => {
    if (event.function.listener === "plus") {
      event.function.parameters[0].value = 3;
      event.function.parameters[1].value = 4;
    }
  });
  connector.on("complete", (event) => {
    if (event.function.listener === "plus") event.return.value += 0.2;
  });

  acceptor.on("receive", (event) => {
    if (event.function.listener === "multiplies") {
      event.function.parameters[0].value = 2;
      event.function.parameters[1].value = 7;
    }
  });
  acceptor.on("return", (event) => {
    if (event.function.listener === "multiplies") event.return.value += 0.1;
  });

  // VALIDATE
  const driver: Driver<ICalculator> = connector.getDriver();
  if (7.2 !== (await driver.plus(1, 1)))
    throw new Error("Failed to hook request evevnt");
  if (14.1 !== (await driver.multiplies(1, 1)))
    throw new Error("Failed to hook response event");

  await server.close();
}
