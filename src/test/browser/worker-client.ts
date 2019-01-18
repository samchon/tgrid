import "whatwg-fetch";

import { WorkerConnector } from "../../protocols/workers";
import { ICalculator } from "../controllers/ICalculator";
import { complete } from "./internal";

async function get_source(): Promise<string>
{
    let url: string = location.href;
    url = url.substr(0, url.lastIndexOf("/")) + "/worker-server.js";

    let response: Response = await fetch(url, {method: "GET"});
    return await response.text();
}

window.onload = async () =>
{
    let worker = new WorkerConnector();
    await worker.compile(await get_source());

    await ICalculator.main(worker.getDriver<ICalculator>(), true);
    await worker.close();
    
    complete();
};