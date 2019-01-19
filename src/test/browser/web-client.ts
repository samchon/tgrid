import { WebConnector } from "../../protocols/web";
import { ICalculator } from "../controllers/ICalculator";
import { complete } from "./internal";

window.onload = async () =>
{
    let connector = new WebConnector();

    for (let i: number = 0; i < 5; ++i)
    {
        await connector.connect("ws://127.0.0.1:10489");

        await ICalculator.main(connector.getDriver<ICalculator>(), true);
        await connector.close();
    }
    complete();
};