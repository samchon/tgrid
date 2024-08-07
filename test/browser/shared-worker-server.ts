import { SharedWorkerServer } from "tgrid";

import { Calculator } from "../providers/Calculator";

/// chrome://inspect/#workers
async function main(): Promise<void> {
  const server: SharedWorkerServer<object, Calculator, null> =
    new SharedWorkerServer();
  await server.open(async (acceptor) => {
    console.log(acceptor.header);
    await acceptor.accept(new Calculator());
  });
}
main().catch((exp) => {
  console.log(exp);
  process.exit(-1);
});
