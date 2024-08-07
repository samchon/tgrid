import { WorkerServer } from "tgrid";

import { Statistics } from "../../../../providers/Calculator";

async function main(): Promise<void> {
  const server: WorkerServer<object, Statistics, null> = new WorkerServer();
  await server.open(new Statistics());
}
main().catch((exp) => {
  console.log(exp);
  process.exit(-1);
});
