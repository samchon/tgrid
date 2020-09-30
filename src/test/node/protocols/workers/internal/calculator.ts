import { WorkerServer } from "../../../../../protocols/workers/WorkerServer";
import { WorkerConnector } from "../../../../../protocols/workers/WorkerConnector";
import { Driver } from "../../../../../components/Driver";

import { Simple } from "../../../../providers/Calculator";
import { IScientific, IStatistics } from "../../../../controllers/ICalculator";

class HierarchicalCalculator extends Simple
{
    // REMOTE CALCULATOR
    public scientific!: Driver<IScientific>;
    public statistics!: Driver<IStatistics>;
}

async function get<Controller extends object>
    (path: string): Promise<Driver<Controller>>
{
    // DO CONNECT
    const connector: WorkerConnector<null, null> = new WorkerConnector(null, null);
    await connector.connect(path);

    // RETURN DRIVER
    return connector.getDriver<Controller>();
}

async function main(): Promise<void>
{
    // PREPARE REMOTE CALCULATOR
    const calc = new HierarchicalCalculator();
    calc.scientific = await get<IScientific>(__dirname + "/scientific.js");
    calc.statistics = await get<IStatistics>(__dirname + "/statistics.js");

    // OPEN SERVER
    const server = new WorkerServer();
    await server.open(calc);
}
main();