import { WorkerConnector } from "../../../protocols/workers";
import { Driver } from "../../../basic";

import { ICalculator } from "../../internal/ICalculator";

export async function test_hierarchical_workers(): Promise<void>
{
	// DO CONNECT
	let connector: WorkerConnector = new WorkerConnector();
	await connector.connect(__dirname + "/internal/calculator.js");

	// DO TEST
	let driver: Driver<ICalculator> = connector.getDriver<ICalculator>();
	await ICalculator.main(driver);
	
	// TERMINATE
	await connector.close();
}