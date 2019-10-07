import { WebServer } from "../../protocols/web/WebServer";
import { WebConnector } from "../../protocols/web/WebConnector";

import { Driver } from "../../components/Driver";
import { Calculator } from "../providers/Calculator";

async function must_be_error(procedures: (() => Promise<void>)[]): Promise<void>
{
    let count: number = 0;
    for (let proc of procedures)
        try
        {
            await proc();
        }
        catch (exp)
        {
            console.log("  - " + exp.name, exp.message);
            ++count;
        }
    if (count !== procedures.length)
        throw new Error("Must be security error");
}

export async function test_security(): Promise<void>
{
    let server: WebServer = new WebServer();
    await server.open(10101, async acceptor =>
    {
        await acceptor.accept(new Calculator());
    });

    let connector: WebConnector = new WebConnector();
    await connector.connect("ws://127.0.0.1:10101");

    let calc: Driver<Calculator> = connector.getDriver();
    await must_be_error([
        () => (calc.plus as any).toString(),
        () => (calc as any).prototype.toString(),
        () => (calc.scientific as any).constructor.toString(),
        () => (calc.statistics.mean as any).prototype.minus(7, 4)
    ])

    await connector.close();
    await server.close();
}