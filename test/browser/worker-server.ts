import { WorkerServer } from "tgrid";

import { Calculator } from "../providers/Calculator";

async function main(): Promise<void> {
  const server: WorkerServer<object, Calculator> = new WorkerServer();
  await server.open(new Calculator());
}
main().catch((exp) => {
  console.log(exp);
  process.exit(-1);
});
