import { WorkerServer } from "../../../protocols/workers/WorkerServer";
import { Calculator } from "../../internal/Calculator";

async function main(): Promise<void>
{
	let server = new WorkerServer();
	if (server.arguments.pop() !== "second")
		throw new Error("Error on WorkerServer.arguments");

	await server.open(new Calculator());
}
main();