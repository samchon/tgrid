import { WebServer, WebConnector } from "../../../protocols/web";
import { Driver } from "../../../basic";

import { IScript } from "../../controllers/IScript";
import { IChatService } from "../../controllers/IChatService";
import { IChatPrinter } from "../../controllers/IChatPrinter";

import { DomainError, LengthError } from "tstl/exception";
import { HashMap } from "tstl/container/HashMap";
import { Latch } from "tstl/experimental/thread/Latch";
import { sleep_for } from "tstl/thread";

const PORT = 10101;

const SCRIPTS: IScript[] = 
[
    { name: "Administrator", message: "The Chat Application has been started." },
    { name: "Jeongho Nam", message: "Hello, my name is Jeongho Nam, author of the TGrid." },
    { name: "Sam", message: "I'm Sam, nice to meet you." },
    { name: "Administrator", message: "Welcome two participants. Nice to meet you too." },
    { name: "Jeongho Nam", message: "Nice to meet you three." },
    { name: "Mad Scientist", message: "HAHAHAHAHAHA" },
    { name: "Sam", message: "???????" },
    { name: "Jeongho Nam", message: "I'm going to sleep. See you tomorrow." },
    { name: "Administrator", message: "See ya~" },
    { name: "Mad Scientist", message: "Conquer all over the world~!!" },
    { name: "Sam", message: "Good bye~!!" }
];

function validate(x: IScript[], y: IScript[]): void
{
    if (x.length !== y.length)
        throw new LengthError("Different length between two scripts.");

    for (let i: number = 0; i < x.length; ++i)
        if (x[i].name !== y[i].name || x[i].message !== y[i].message)
            throw new DomainError("Different script exists.");
}

/* ----------------------------------------------------------------
    CLIENT
---------------------------------------------------------------- */
class Client
{
    private name_!: string;
    private connector_!: WebConnector<IChatPrinter>;
    private scripts_!: IScript[];

    private service_!: Driver<IChatService>;

    public async participate(name: string): Promise<void>
    {
        // ASSIGN MEMBERS
        this.name_ = name;
        this.connector_ = new WebConnector
        ({
            print: (name: string, message: string): void =>
            {
                this.scripts_.push({ name: name, message: message });
            }
        });
        this.service_ = this.connector_.getDriver<IChatService>();
        this.scripts_ = [];
        
        // PREPARE INTERACTION
        await this.connector_.connect("http://127.0.0.1:" + PORT);
        await this.service_.setName(name);
    }

    public async shout(): Promise<void>
    {
        for (let script of SCRIPTS)
        {
            await sleep_for(50);
            if (script.name === this.name_)
                await this.service_.talk(script.message);
        }
    }

    public async close(): Promise<IScript[]>
    {
        await this.connector_.close();
        return this.scripts_;
    }
}

/* ----------------------------------------------------------------
    SERVER
---------------------------------------------------------------- */
class Server
{
    private server_!: WebServer<IChatService>;
    private participants_!: HashMap<string, Driver<IChatPrinter>>;

    private scripts_!: IScript[];

    public async open(): Promise<void>
    {
        this.server_ = new WebServer();
        this.participants_ = new HashMap();
        this.scripts_ = [];

        await this.server_.open(PORT, async acceptor =>
        {
            let service: IChatService & { name: string } = 
            {
                name: "",
                setName: (newName: string): boolean =>
                {
                    if (this.participants_.has(newName))
                        return false;

                    service.name = newName;
                    this.participants_.emplace(service.name, acceptor.getDriver<IChatPrinter>());
                    return true;
                },
                talk: (message: string): void =>
                {
                    this.scripts_.push({ name: service.name, message: message });
                    for (let entry of this.participants_)
                        entry.second.print(service.name, message).catch(() => {});
                }
            };
            await acceptor.accept(service);
            await acceptor.join();

            if (service.name)
                this.participants_.erase(service.name);
        });
    }

    public async close(): Promise<IScript[]>
    {
        await this.server_.close();
        return this.scripts_;
    }
}

/* ----------------------------------------------------------------
    MAIN
---------------------------------------------------------------- */
export async function test_web_chat(): Promise<void>
{
    let server: Server = new Server();
    await server.open();

    let clientMap: HashMap<string, Client> = new HashMap();
    for (let script of SCRIPTS)
        if (clientMap.has(script.name) === false)
        {
            let c: Client = new Client();
            await c.participate(script.name);

            clientMap.emplace(script.name, c);
        }

    let latch: Latch = new Latch(clientMap.size());
    for (let entry of clientMap)
        entry.second.shout().then(() =>
        {
            latch.arrive();
        });
    await latch.wait();

    for (let entry of clientMap)
    {
        let scripts: IScript[] = await entry.second.close();
        validate(SCRIPTS, scripts);
    }
    validate(SCRIPTS, await server.close());
}