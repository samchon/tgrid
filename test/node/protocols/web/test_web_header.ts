import { WebConnector, WebServer } from "tgrid";

const PORT = 10101;
const TOKEN = "asdfawe4fasdfchswrtgadfg";

interface IHeaders {
  token: string;
}

export async function test_web_header(): Promise<void> {
  const server: WebServer<IHeaders, null, null> = new WebServer();
  await server.open(PORT, async (acceptor) => {
    if (acceptor.header.token !== TOKEN) await acceptor.reject();
    else await acceptor.accept(null);
  });

  const connector: WebConnector<IHeaders, null, null> = new WebConnector(
    { token: TOKEN },
    null,
  );
  await connector.connect(`ws://127.0.0.1:${PORT}`);
  await connector.close();

  await server.close();
}
