import fs from "fs";
import { WorkerConnector } from "tgrid";
import { sleep_for } from "tstl";

const FILE_PATH = __dirname + "/log.dat";

export async function test_worker_join(): Promise<void> {
  await fs.promises.writeFile(FILE_PATH, "NOT YET", "utf8");

  const connector: WorkerConnector<null, null> = new WorkerConnector(
    null,
    null,
  );
  await connector.connect(__dirname + "/internal/join.js");

  sleep_for(1_000)
    .then(() => connector.close())
    .catch(() => {});
  await connector.join();

  await sleep_for(50);
  const content: string = await fs.promises.readFile(FILE_PATH, "utf8");
  await fs.promises.unlink(FILE_PATH);

  if (content !== "WorkerServer.join()")
    throw new Error("Error on WorkerServer.join()");
}
