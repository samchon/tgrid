import { ICalculator } from "../base/ICalculator";
import { WorkerConnector } from "../../protocol/worker/WorkerConnector";

export async function test_process(): Promise<void>
{
	let connector: WorkerConnector = new WorkerConnector();
	connector.connect(__dirname + "/instances/process-server");

	await ICalculator.main(connector.getDriver<ICalculator>());
	connector.close();
}