import { WebConnector, WebServer } from "tgrid";

const PORT = 10101;

export async function test_web_server_close(): Promise<void> {
  const server: WebServer<null, null> = new WebServer();
  await server.open(PORT, (acceptor) => acceptor.accept(null));

  for (let i: number = 0; i < 100; ++i) {
    const connector: WebConnector<null, null> = new WebConnector(null, null);
    await connector.connect(`ws://127.0.0.1:${PORT}`);
  }
  await server.close();
}
