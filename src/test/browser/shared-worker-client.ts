import { SharedWorkerConnector } from "../../protocols/workers";
import { ICalculator } from "../controllers/ICalculator";
import { complete } from "./internal";

window.onload = async () =>
{
    let worker: SharedWorkerConnector<{}, null> = new SharedWorkerConnector(null);

    // TEST RE-USABILITY
    for (let i: number = 0; i < 5; ++i)
    {
        await worker.connect("shared-worker-server.js", ["first", "second", "third"]);

        await ICalculator.main(worker.getDriver<ICalculator>());
        await worker.close();
    }
    complete();
};