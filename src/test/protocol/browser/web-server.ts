import { WebServer } from "../../../protocol/web";
import { Calculator } from "../../base/Calculator";

async function main(): Promise<void>
{
	let server = new WebServer();
	await server.open(10489, async acceptor =>
	{
		await acceptor.accept();
		await acceptor.listen(new Calculator());
	});
}
main();