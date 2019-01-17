import * as std from "tstl";

import { WebServer, WebConnector } from "../../../protocols/web";
import { Driver } from "../../../basic"

import { Calculator } from "../../providers/Calculator";
import { ICalculator } from "../../controllers/ICalculator";
import { IVector } from "../../controllers/IVector";

const PORT: number = 10101;

export async function test_web_calculator(): Promise<void>
{
    //----
    // SERVER
    //----
    let server: WebServer = new WebServer();
    await server.open(PORT, async acceptor =>
    {
        // SPEICFY PROVIDER
        let provider = /calculator/.test(acceptor.path)
            ? new Calculator()
            : new std.Vector<number>();

        // ALLOW CONNECTION
        await acceptor.accept(provider);
    });

    //----
    // CLIENTS
    //----
    for (let path of ["calculator", "vector"])
    {
        // DO CONNECT
        let connector: WebConnector = new WebConnector();
        await connector.connect(`ws://127.0.0.1:${PORT}/${path}`);

        // SET DRIVER AND TEST BY CALCULATOR PROCESS
        if (path === "calculator")
        {
            let driver: Driver<ICalculator> = connector.getDriver<ICalculator>();
            await ICalculator.main(driver);
        }
        else
        {
            let driver: Driver<IVector<number>> = connector.getDriver<IVector<number>>();
            await IVector.main(driver);
        }
        
        await connector.close();
    }
    await server.close();
}