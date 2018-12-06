import { Communicator } from "../../basic/Communicator";

import { Calculator } from "../internal/Calculator";
import { ICalculator } from "../internal/ICalculator";

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
	let controller: ICalculator = client.getDriver<ICalculator>();

	// DO TEST
	await ICalculator.main(controller);
}
