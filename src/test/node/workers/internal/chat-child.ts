import { WorkerServer } from "../../../../protocols/workers";
import { IScript } from "../../../controllers/IScript";
import { Driver } from "../../../../basic";
import { IChatService } from "../../../controllers/IChatService";

import { sleep_for } from "tstl/thread/global";

async function main(): Promise<void>
{
    //----
    // PREPARATIONS
    //----
    // OPEN SERVER
    let server: WorkerServer = new WorkerServer();
    let scripts: IScript[] = [];

    // PREPARE ASSETS
    let myName: string = server.arguments[0];
    let service: Driver<IChatService> = server.getDriver<IChatService>();

    await server.open
    ({
        shout: async () =>
        {
            for (let script of IScript.SCENARIO)
            {
                await sleep_for(50);
                if (script.name === myName)
                    await service.talk(script.message);
            }
        },
        print: (name: string, message: string) =>
        {
            scripts.push({ name: name, message: message });
        },
        validate: () =>
        {
            IScript.validate(scripts);
        }
    });
    await service.setName(myName);
}
main();