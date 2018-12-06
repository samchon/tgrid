import { WebConnector } from "../../../protocol/web";
import { ICalculator } from "../../internal/ICalculator";

window.onload = async () =>
{
	let connector = new WebConnector();
	await connector.connect("ws://127.0.0.1:10489");
	await connector.wait();

	await ICalculator.main(connector.getDriver<ICalculator>(), true);
	await connector.close();
};