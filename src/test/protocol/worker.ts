import { ICalculator } from "../base/ICalculator";
import { WorkerConnector } from "../../protocol/worker/WorkerConnector";

export async function test_process(): Promise<void>
{
	let connector: WorkerConnector = new WorkerConnector();
	await connector.connect(__dirname + "/instances/process-server");

	console.log("Connected to Worker Server.");

	await ICalculator.main(connector.getDriver<ICalculator>());
	await connector.close();
}