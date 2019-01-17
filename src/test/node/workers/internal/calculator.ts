import { WorkerServer, WorkerConnector } from "../../../../protocols/workers";
import { Driver } from "../../../../basic";

import { Simple } from "../../../providers/Calculator";
import { IScientific, IStatistics } from "../../../controllers/ICalculator";

class HierarchicalCalculator extends Simple
{
    // REMOTE CALCULATOR
    public scientific: Driver<IScientific>;
    public statistics: Driver<IStatistics>;
}

async function get<Controller extends object>
    (path: string): Promise<Driver<Controller>>
{
    // DO CONNECT
    let connector = new WorkerConnector();
    await connector.connect(path);

    // RETURN DRIVER
    return connector.getDriver<Controller>();
}

async function main(): Promise<void>
{
    // PREPARE REMOTE CALCULATOR
    let calc = new HierarchicalCalculator();
    calc.scientific = await get<IScientific>(__dirname + "/scientific.js");
    calc.statistics = await get<IStatistics>(__dirname + "/statistics.js");

    // OPEN SERVER
    let server = new WorkerServer();
    await server.open(calc);
}
main();