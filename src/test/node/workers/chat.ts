import { WorkerConnector } from "../../../protocols/workers";
import { Driver } from "../../../basic";

import { ChatService } from "../../providers/ChatService";
import { IChatPrinter } from "../../controllers/IChatPrinter";

import { IScript } from "../../controllers/IScript";
import { Latch } from "tstl/experimental/thread";

interface IChatClient extends IChatPrinter
{
    shout(): void;
    validate(): void;
}

interface Instance
{
    connector: WorkerConnector<ChatService>;
    provider: ChatService;
    driver: Driver<IChatClient>;
}

export async function test_worker_chat(): Promise<void>
{
    let instanceList: Instance[] = [];
    let scripts: IScript[] = [];

    // OPEN CONNECTORS
    for (let name of IScript.PEOPLE)
    {
        let provider = new ChatService();
        let connector = new WorkerConnector<ChatService>(provider);
        let driver = connector.getDriver<IChatClient>();

        await provider.assign(driver, scripts);
        await connector.connect(__dirname + "/internal/chat-child.js", name);

        instanceList.push({
            connector: connector,
            provider: provider,
            driver: driver
        });
    }

    // START CHATTING
    let latch: Latch = new Latch(instanceList.length);
    for (let instace of instanceList)
        instace.driver.shout().then(() => latch.arrive());

    await latch.wait();

    // VALIDATES
    for (let instance of instanceList)
    {
        await instance.driver.validate();

        await instance.connector.close();
        await instance.provider.destroy();
    }
    IScript.validate(scripts);
}