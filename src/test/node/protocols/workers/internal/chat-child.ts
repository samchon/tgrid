import { WorkerServer } from "../../../../../protocols/workers/WorkerServer";
import { IScript } from "../../../../controllers/IScript";
import { Driver } from "../../../../../components/Driver";
import { IChatService } from "../../../../controllers/IChatService";

import { sleep_for } from "tstl/thread/global";

async function main(): Promise<void>
{
    //----
    // PREPARATIONS
    //----
    // OPEN SERVER
    const server: WorkerServer<{ name: string }, object> = new WorkerServer();
    const scripts: IScript[] = [];

    // PREPARE ASSETS
    const myName: string = (await server.getHeader()).name;
    const service: Driver<IChatService> = server.getDriver<IChatService>();

    await server.open
    ({
        shout: async () =>
        {
            for (const script of IScript.SCENARIO)
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