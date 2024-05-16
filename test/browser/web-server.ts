import { WebSocketServer } from "tgrid";

import { Calculator } from "../providers/Calculator";

async function main(): Promise<void> {
  const server: WebSocketServer<object, Calculator, null> =
    new WebSocketServer();
  let index: number = 0;

  await server.open(10489, async (acceptor) => {
    await acceptor.accept(new Calculator());

    await acceptor.join();
    if (++index === 5) await server.close();
  });
}
main().catch((exp) => {
  console.log(exp);
  process.exit(-1);
});
