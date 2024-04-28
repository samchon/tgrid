import { Driver, WorkerServer } from "tgrid";
import { sleep_for } from "tstl";

import { IChatService } from "../../../../controllers/IChatService";
import { IScript } from "../../../../controllers/IScript";

async function main(): Promise<void> {
  //----
  // PREPARATIONS
  //----
  // OPEN SERVER
  const server: WorkerServer<{ name: string }, object, IChatService> =
    new WorkerServer();
  const scripts: IScript[] = [];

  // PREPARE ASSETS
  const myName: string = (await server.getHeader()).name;
  const service: Driver<IChatService> = server.getDriver();

  await server.open({
    shout: async () => {
      for (const script of IScript.SCENARIO) {
        await sleep_for(50);
        if (script.name === myName) await service.talk(script.message);
      }
    },
    print: (name: string, message: string) => {
      scripts.push({ name: name, message: message });
    },
    validate: () => {
      IScript.validate(scripts);
    },
  });
  await service.setName(myName);
}
main().catch((exp) => {
  console.log(exp);
  process.exit(-1);
});
