import fs from "fs";
import { WorkerServer } from "tgrid";

const FILE_PATH = __dirname + "/../log.dat";

async function main(): Promise<void> {
  const server: WorkerServer<null, null> = new WorkerServer();
  await server.open(null);
  await server.join();

  await fs.promises.writeFile(FILE_PATH, "WorkerServer.join()", "utf8");
}
main().catch((exp) => {
  console.log(exp);
  process.exit(-1);
});
