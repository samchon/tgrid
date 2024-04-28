import { WebServer } from "tgrid";

import { Calculator } from "../providers/Calculator";

async function main(): Promise<void> {
  const server: WebServer<object, Calculator, null> = new WebServer();
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
