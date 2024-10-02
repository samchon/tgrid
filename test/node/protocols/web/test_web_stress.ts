import { WebSocketServer, WorkerConnector } from "tgrid";

export async function test_web_stress(): Promise<void> {
  const server: WebSocketServer<null, Calculator, null> = new WebSocketServer();
  await server.open(12_345, async (acceptor) => {
    await acceptor.accept(new Calculator());
  });

  const counts: number[] = await Promise.all(
    new Array(VOLUME).fill(0).map(async () => {
      const worker = new WorkerConnector(null, null, "process");
      await worker.connect(`${__dirname}/internal/_test_web_stress_client.js`);
      const success: number = await worker.getDriver<IServant>().execute();
      await worker.close();
      return success;
    }),
  );
  if (counts.reduce((x, y) => x + y) !== VOLUME * 100)
    throw new Error("Error on stress test");
  await server.close();
}

interface IServant {
  execute(): number;
}
class Calculator {
  public plus(x: number, y: number): number {
    return x + y;
  }
}

const VOLUME = 10;
