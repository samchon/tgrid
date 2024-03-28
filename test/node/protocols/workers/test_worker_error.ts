import { WorkerConnector } from "tgrid";

import { ErrorService } from "../../../providers/ErrorService";

export async function test_worker_error(): Promise<void> {
  const worker = new WorkerConnector(null, null, "process");
  await worker.connect(`${__dirname}/internal/error.js`);

  const service = worker.getDriver<ErrorService>();
  try {
    await service.generate();
  } catch {
    return;
  } finally {
    await worker.close();
  }
  throw new Error("Failed to catch error");
}
