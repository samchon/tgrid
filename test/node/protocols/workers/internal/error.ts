import { WorkerServer } from "tgrid";

import { ErrorService } from "../../../../providers/ErrorService";

async function main(): Promise<void> {
  const server: WorkerServer<null, ErrorService, null> = new WorkerServer();
  await server.open(new ErrorService());
  await server.join();
}
main().catch((exp) => {
  console.log(exp);
  process.exit(-1);
});
