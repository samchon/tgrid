import { WebServer } from "../../../../protocols/web/WebServer";
import { WebConnector } from "../../../../protocols/web/WebConnector";

const PORT = 10101;

export async function test_web_reject(): Promise<void>
{
    const server = new WebServer<null, null>();

    // TEST RE-USABILITY TOO
    for (let i: number = 0; i < 5; ++i)
    {
        await server.open(PORT, async acceptor =>
        {
            await acceptor.reject(1001, "Rejected by test automation program.");
        });

        const connector: WebConnector<null, null> = new WebConnector(null, null);
        let error: Error | null = null;

        try
        {
            await connector.connect(`ws://127.0.0.1:${PORT}`);
        }
        catch (exp)
        {
            error = exp as Error;
        }
        await server.close();
        
        if (error === null)
            throw new Error("Catching reject has failed.");
    }
}