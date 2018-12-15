import { SharedWorkerConnector } from "../../protocols/workers";
import { ICalculator } from "../internal/ICalculator";
import { complete } from "./internal";

window.onload = async () =>
{
	let worker = new SharedWorkerConnector();
	await worker.connect("shared-worker-server.js");
	await worker.wait();

	await ICalculator.main(worker.getDriver<ICalculator>(), true);
	await worker.close();

	complete();
};