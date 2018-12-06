import { sleep_for } from "tstl/thread";

import { SharedWorkerConnector } from "../../../protocol/worker";
import { ICalculator } from "../../internal/ICalculator";

window.onload = async () =>
{
	let worker = new SharedWorkerConnector();
	await worker.connect("shared-worker-server.js");
	await worker.wait();

	await ICalculator.main(worker.getDriver<ICalculator>(), true);

	console.log("Disconnected after 5 seconds later.");
	await sleep_for(5000);
	await worker.close();
};