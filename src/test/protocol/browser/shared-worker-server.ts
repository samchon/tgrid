import { SharedWorkerServer } from "../../../protocol/worker";
import { Calculator } from "../../internal/Calculator";

/// chrome://inspect/#workers
async function main(): Promise<void>
{
	let i: number = 0;
	new SharedWorkerServer(async acceptor =>
	{
		console.log(++i, "th client has connected.");

		await acceptor.accept();
		await acceptor.listen(new Calculator());
	});
}
main();