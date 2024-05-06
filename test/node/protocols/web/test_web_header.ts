import { WebSocketConnector, WebSocketServer } from "tgrid";

const PORT = 10101;
const TOKEN = "asdfawe4fasdfchswrtgadfg";

interface IHeaders {
  token: string;
}

export async function test_web_header(): Promise<void> {
  const server: WebSocketServer<IHeaders, null, null> = new WebSocketServer();
  await server.open(PORT, async (acceptor) => {
    if (acceptor.header.token !== TOKEN) await acceptor.reject();
    else await acceptor.accept(null);
  });

  const connector: WebSocketConnector<IHeaders, null, null> =
    new WebSocketConnector({ token: TOKEN }, null);
  await connector.connect(`ws://127.0.0.1:${PORT}`);
  await connector.close();

  await server.close();
}
