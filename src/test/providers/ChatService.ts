import { IChatService } from "../controllers/IChatService";

import { Driver } from "../../basic";
import { HashMap } from "tstl/container/HashMap";
import { IChatPrinter } from "../controllers/IChatPrinter";

export class ChatService implements IChatService
{
    private static participants_: HashMap<string, Driver<IChatPrinter>> = new HashMap();
    private driver_: Driver<IChatPrinter> = null;
    private name_: string = null;

    public assign(driver: Driver<IChatPrinter>): void
    {
        this.driver_ = driver;
    }

    public destroy(): void
    {
        if (this.name_ !== null)
            ChatService.participants_.erase(this.name_);
    }

    public setName(str: string): boolean
    {
        if (ChatService.participants_.has(str))
            return false; // DUPLICATED NAME
        
        // SET NAME AND ENROLL IT TO DICTIONARY
        this.name_ = str;
        ChatService.participants_.emplace(str, this.driver_);

        // INFORMS TRUE TO CLIENT
        return true;
    }

    public talk(content: string): void
    {
        // INFORM TO EVERYBODY
        for (let it of ChatService.participants_)
        {
            let driver: Driver<IChatPrinter> = it.second;
            if (driver === this.driver_)
                continue; // SKIP HIMSELF

            // INFORM IT TO CLIENT
            let promise: Promise<void> = driver.print(this.name_, content)

            // DISCONNECTION WHILE TALKING MAY POSSIBLE
            promise.catch(() => {}); 
        }
        console.log(this.name_ + ": " + content);
    }
}