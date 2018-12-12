import { SharedWorkerServer } from "../../../protocols/workers";
import { Calculator } from "../../internal/Calculator";

/// chrome://inspect/#workers
async function main(): Promise<void>
{
	let i: number = 0;
	let server = new SharedWorkerServer();
	
	await server.open(async acceptor =>
	{
		console.log(++i, "th client has connected.");

		await acceptor.accept();
		await acceptor.listen(new Calculator());
	});
}
main();