import { WorkerConnector } from "tgrid";
import "whatwg-fetch";

import { ICalculator } from "../controllers/ICalculator";
import { complete } from "./internal";

async function get_source(): Promise<string> {
  let url: string = location.href;
  url = url.substr(0, url.lastIndexOf("/")) + "/worker-server.js";

  const response: Response = await fetch(url, { method: "GET" });
  return await response.text();
}

window.onload = async () => {
  const worker: WorkerConnector<null, null> = new WorkerConnector(null, null);

  for (let i: number = 0; i < 5; ++i) {
    await worker.compile(await get_source());

    await ICalculator.main(worker.getDriver<ICalculator>());
    await worker.close();
  }
  complete();
};
