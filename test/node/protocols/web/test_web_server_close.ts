import { WebSocketConnector, WebSocketServer } from "tgrid";

const PORT = 10101;

export async function test_web_server_close(): Promise<void> {
  const server: WebSocketServer<null, null, null> = new WebSocketServer();
  await server.open(PORT, (acceptor) => acceptor.accept(null));

  for (let i: number = 0; i < 100; ++i) {
    const connector: WebSocketConnector<null, null, null> =
      new WebSocketConnector(null, null);
    await connector.connect(`ws://127.0.0.1:${PORT}`);
  }
  await server.close();
}
