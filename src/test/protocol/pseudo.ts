import { Communicator } from "../../base/Communicator";

import { Calculator } from "../base/Calculator";
import { ICalculator } from "../base/ICalculator";

export async function test_pseudo(): Promise<void>
{
	//----
	// SERVER & CLIENT
	//----
	// PRE-DECLARATIONS
	let server: Communicator<Calculator>;
	let client: Communicator;
	
	// CONSTRUCT SYSTEMS
	server = new Communicator(invoke => client.replyData(invoke), ()=>null, new Calculator());
	client = new Communicator(invoke => server.replyData(invoke), ()=>null);

	//----
	// INTERACTS
	//----
	// GET DRIVER
	let driver: ICalculator = client.getDriver<ICalculator>();

	// DO TEST
	await ICalculator.main(driver);
}
