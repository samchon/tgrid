import { WorkerConnector } from "../../../protocol/worker";
import { ICalculator } from "../../base/ICalculator";

window.onload = async () =>
{
	let worker = new WorkerConnector();
	await worker.connect("worker-server.js");

	await ICalculator.main(worker.getDriver<ICalculator>(), true);
	await worker.close();
};