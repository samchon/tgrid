import { WorkerServer } from "tgrid";

import { Scientific } from "../../../../providers/Calculator";

async function main(): Promise<void> {
  const server: WorkerServer<object, Scientific, null> = new WorkerServer();
  await server.open(new Scientific());
}
main().catch((exp) => {
  console.log(exp);
  process.exit(-1);
});
