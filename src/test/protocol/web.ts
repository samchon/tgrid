import * as std from "tstl";

import { WebServer, WebConnector } from "../../protocol/web";
import { Calculator } from "../base/Calculator";
import { ICalculator } from "../base/ICalculator";
import { IVector } from "../base/IVector";

const PORT: number = 10919;

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
		let controller: ICalculator | IVector = connector.getController();
		if (path === "calculator")
			await ICalculator.main(<ICalculator>controller);
		else
			await IVector.main(<IVector>controller);

		await connector.close();
	}

	// CLOSE SERVER TOO
	await server.close();
}

export async function test_web_deny(): Promise<void>
{
	let server = new WebServer();
	await server.open(PORT, async acceptor =>
	{
		await acceptor.deny(404, "Unable to find the matched record.");
		await acceptor.close();
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
		throw new Error("Catching deny has failed.");
}