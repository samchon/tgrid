import { IChatService } from "../controllers/IChatService";

import { HashMap } from "tstl/container/HashMap";
import { IChatPrinter } from "../controllers/IChatPrinter";

import { IScript } from "../controllers/IScript";
import { DomainError } from "tstl/exception/DomainError";
import { Driver } from "tgrid";

export class ChatService implements IChatService {
  private static participants_: HashMap<string, Driver<IChatPrinter>> =
    new HashMap();
  private scripts_!: IScript[];
  private driver_!: Driver<IChatPrinter>;

  private name_?: string;

  public assign(driver: Driver<IChatPrinter>, scripts: IScript[]): void {
    this.driver_ = driver;
    this.scripts_ = scripts;
  }

  public destroy(): void {
    if (this.name_) ChatService.participants_.erase(this.name_);
  }

  public setName(str: string): boolean {
    if (ChatService.participants_.has(str)) return false; // DUPLICATED NAME

    // SET NAME AND ENROLL IT TO DICTIONARY
    this.name_ = str;
    ChatService.participants_.emplace(str, this.driver_);

    // INFORMS TRUE TO CLIENT
    return true;
  }

  public talk(content: string): void {
    if (!this.name_) throw new DomainError("No name");

    // INFORM TO EVERYBODY
    for (const it of ChatService.participants_) {
      const driver: Driver<IChatPrinter> = it.second;

      // INFORM IT TO CLIENT
      const promise: Promise<void> = driver.print(this.name_, content);

      // DISCONNECTION WHILE TALKING MAY POSSIBLE
      promise.catch(() => {});
    }

    // LOG ARCHIVE
    this.scripts_.push({ name: this.name_, message: content });
  }
}
