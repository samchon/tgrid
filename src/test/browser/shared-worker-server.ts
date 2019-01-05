import { SharedWorkerServer } from "../../protocols/workers";
import { Calculator } from "../internal/Calculator";

/// chrome://inspect/#workers
async function main(): Promise<void>
{
	let server = new SharedWorkerServer();
	await server.open(async acceptor =>
	{
		console.log(acceptor.arguments);
		await acceptor.accept(new Calculator());
	});
}
main();