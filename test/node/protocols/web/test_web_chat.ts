import { Driver, WebSocketConnector, WebSocketServer } from "tgrid";
import { sleep_for } from "tstl";

import { IChatPrinter } from "../../../controllers/IChatPrinter";
import { IChatService } from "../../../controllers/IChatService";
import { IScript } from "../../../controllers/IScript";
import { ChatService } from "../../../providers/ChatService";

const PORT = 10101;

/* ----------------------------------------------------------------
CLIENT
---------------------------------------------------------------- */
class Client {
  private name_!: string;
  private connector_!: WebSocketConnector<null, IChatPrinter, IChatService>;
  private scripts_!: IScript[];

  private service_!: Driver<IChatService>;

  public async participate(name: string): Promise<void> {
    // ASSIGN MEMBERS
    this.name_ = name;
    this.connector_ = new WebSocketConnector(null, {
      print: (name: string, message: string): void => {
        this.scripts_.push({ name: name, message: message });
      },
    });
    this.service_ = this.connector_.getDriver();
    this.scripts_ = [];

    // PREPARE INTERACTION
    await this.connector_.connect("http://127.0.0.1:" + PORT);
    await this.service_.setName(name);
  }

  public async shout(): Promise<void> {
    for (const script of IScript.SCENARIO) {
      await sleep_for(50);
      if (script.name === this.name_) await this.service_.talk(script.message);
    }
  }

  public async close(): Promise<IScript[]> {
    await this.connector_.close();
    return this.scripts_;
  }
}

/* ----------------------------------------------------------------
  SERVER
---------------------------------------------------------------- */
class Server {
  private server_!: WebSocketServer<object, IChatService, IChatPrinter>;
  private scripts_!: IScript[];

  public async open(): Promise<void> {
    this.server_ = new WebSocketServer();
    this.scripts_ = [];

    await this.server_.open(PORT, async (acceptor) => {
      const service: ChatService = new ChatService();
      service.assign(acceptor.getDriver(), this.scripts_);

      await acceptor.accept(service);
      await acceptor.join();

      service.destroy();
    });
  }

  public async close(): Promise<IScript[]> {
    await this.server_.close();
    return this.scripts_;
  }
}

/* ----------------------------------------------------------------
  MAIN
---------------------------------------------------------------- */
export async function test_web_chat(): Promise<void> {
  // OPEN SERVER
  const server: Server = new Server();
  await server.open();

  // PREPARE CLIENTS
  const clients: Client[] = [];
  for (const name of IScript.PEOPLE) {
    const c: Client = new Client();
    await c.participate(name);

    clients.push(c);
  }

  // START CHATTING
  const promiseList: Promise<void>[] = [];
  for (const c of clients) promiseList.push(c.shout());
  await Promise.all(promiseList);

  // VALIDATIONS
  for (const c of clients) {
    const scripts: IScript[] = await c.close();
    IScript.validate(scripts);
  }
  IScript.validate(await server.close());
}
