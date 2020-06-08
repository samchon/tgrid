import { WebServer } from "../../../../protocols/web/WebServer";
import { WebConnector } from "../../../../protocols/web/WebConnector";

const PORT = 10101;

export async function test_web_reject(): Promise<void>
{
    let server = new WebServer<{}, null>();

    // TEST RE-USABILITY TOO
    for (let i: number = 0; i < 5; ++i)
    {
        await server.open(PORT, async acceptor =>
        {
            await acceptor.reject(1001, "Rejected by test automation program.");
        });

        let connector: WebConnector<{}, null> = new WebConnector(null);
        let error: Error | null = null;

        try
        {
            await connector.connect(`ws://127.0.0.1:${PORT}`, {});
        }
        catch (exp)
        {
            error = exp;
        }
        await server.close();
        
        if (error === null)
            throw new Error("Catching reject has failed.");
    }
}