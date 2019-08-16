import { WorkerConnector } from "../../../protocols/workers";
import { Driver } from "../../../basic";

import { ChatService } from "../../providers/ChatService";
import { IChatPrinter } from "../../controllers/IChatPrinter";
import { IScript } from "../../controllers/IScript";

interface IChatClient extends IChatPrinter
{
    shout(): void;
    validate(): void;
}

interface Instance
{
    name: string;
    connector: WorkerConnector<ChatService>;
    provider: ChatService;
    driver: Driver<IChatClient>;
}

export async function test_worker_chat(): Promise<void>
{
    let instanceList: Instance[] = [];
    
    // OPEN CONNECTORS
    for (let name of IScript.PEOPLE)
    {
        let provider = new ChatService();
        let connector = new WorkerConnector<ChatService>(provider);
        let driver = connector.getDriver<IChatClient>();
        
        instanceList.push({
            name: name,
            connector: connector,
            provider: provider,
            driver: driver
        });
    }

    // TEST RE-USABILITY
    for (let i: number = 0; i < 5; ++i)
    {
        let scripts: IScript[] = [];

        // CONNECT
        for (let instance of instanceList)
        {
            await instance.provider.assign(instance.driver, scripts);
            await instance.connector.connect(__dirname + "/internal/chat-child.js", instance.name);
        }

        // START CHATTING
        let promiseList: Promise<void>[] = [];
        for (let instance of instanceList)
            promiseList.push(instance.driver.shout());

        await Promise.all(promiseList);

        // VALIDATES
        for (let instance of instanceList)
        {
            await instance.driver.validate();
            await instance.connector.close();
            await instance.provider.destroy();
        }
        IScript.validate(scripts);
    }
}