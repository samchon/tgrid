import { WorkerConnector } from "../../../../protocols/workers";
import { Driver } from "../../../../components";

import { ICalculator } from "../../../controllers/ICalculator";

export async function test_hierarchical_workers(): Promise<void>
{
    let connector: WorkerConnector = new WorkerConnector();
    for (let i: number = 0; i < 5; ++i)
    {
        // DO CONNECT
        await connector.connect(__dirname + "/internal/calculator.js");

        // DO TEST
        let driver: Driver<ICalculator> = connector.getDriver<ICalculator>();
        await ICalculator.main(driver);
        
        // TERMINATE
        await connector.close();
    }
}