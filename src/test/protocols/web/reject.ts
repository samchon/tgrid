import { WebServer } from "../../../protocols/web/WebServer";
import { WebConnector } from "../../../protocols/web/WebConnector";

const PORT = 10101;

export async function test_web_reject(): Promise<void>
{
    let server = new WebServer();
    await server.open(PORT, async acceptor =>
    {
        await acceptor.reject(404, "Unable to find the matched record.");
    });

    let connector = new WebConnector();
    let error: Error = null;

    try
    {
        await connector.connect(`ws://127.0.0.1:${PORT}`);
    }
    catch (exp)
    {
        error = exp;
    }
    await server.close();

    if (!error)
        throw new Error("Catching reject has failed.");
}