import { Communicator } from "../../basic/Communicator";
import { Driver } from "../../basic/Driver";

import { Calculator } from "../providers/Calculator";
import { ICalculator } from "../controllers/ICalculator";

export async function test_pseudo(): Promise<void>
{
    //----
    // SERVER & CLIENT
    //----
    // PRE-DECLARATIONS
    let server: Communicator<Calculator>;
    let client: Communicator;
    
    // CONSTRUCT SYSTEMS
    server = new Communicator(invoke => client.replyData(invoke), ()=>null, new Calculator());
    client = new Communicator(invoke => server.replyData(invoke), ()=>null);

    //----
    // INTERACTS
    //----
    // GET DRIVER
    let driver: Driver<ICalculator> = client.getDriver<ICalculator>();

    // DO TEST
    await ICalculator.main(driver);
}
