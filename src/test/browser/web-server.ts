import { WebServer } from "../../protocols/web";
import { Calculator } from "../internal/Calculator";

async function main(): Promise<void>
{
	let server = new WebServer();
	await server.open(10489, async acceptor =>
	{
		await acceptor.accept();
		await acceptor.listen(new Calculator());

		await acceptor.join();
		await server.close();
	});
}
main();