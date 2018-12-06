import * as std from "tstl";

import { WebServer, WebConnector } from "../../protocol/web";
import { Calculator } from "../internal/Calculator";
import { ICalculator } from "../internal/ICalculator";
import { IVector } from "../internal/IVector";

const PORT: number = 10101;

export async function test_web(): Promise<void>
{
	//----
	// SERVER
	//----
	let server: WebServer = new WebServer();
	await server.open(PORT, async acceptor =>
	{
		await acceptor.accept(); // ALLOW CONNECTION
		await acceptor.listen(/calculator/.test(acceptor.path)
			? new Calculator()
			: new std.Vector<number>()); // SET LISTENER
	});

	//----
	// CLIENTS
	//----
	for (let path of ["calculator", "vector"])
	{
		// DO CONNECT
		let connector: WebConnector = new WebConnector();
		await connector.connect(`ws://127.0.0.1:${PORT}/${path}`);
		await connector.wait();

		// SET DRIVER AND TEST BY CALCULATOR PROCESS
		let controller: ICalculator | IVector = connector.getDriver();
		if (path === "calculator")
			await ICalculator.main(<ICalculator>controller);
		else
			await IVector.main(<IVector>controller);
		
		await connector.close();
	}
	await server.close();
}

export async function test_web_reject(): Promise<void>
{
	let server = new WebServer();
	await server.open(PORT, async acceptor =>
	{
		await acceptor.reject(404, "Unable to find the matched record.");
	});

	let connector = new WebConnector();
	let error: Error = null;

	try
	{
		await connector.connect(`ws://127.0.0.1:${PORT}`);
	}
	catch (exp)
	{
		error = exp;
	}
	await server.close();

	if (!error)
		throw new Error("Catching reject has failed.");
}