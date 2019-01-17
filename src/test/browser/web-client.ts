import { WebConnector } from "../../protocols/web";
import { ICalculator } from "../controllers/ICalculator";
import { complete } from "./internal";

window.onload = async () =>
{
    let connector = new WebConnector();
    await connector.connect("ws://127.0.0.1:10489");

    await ICalculator.main(connector.getDriver<ICalculator>(), true);
    await connector.close();

    complete();
};