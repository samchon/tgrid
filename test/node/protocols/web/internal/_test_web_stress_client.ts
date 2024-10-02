import { WebSocketConnector, WorkerServer } from "tgrid";
import { sleep_for } from "tstl";

interface ICalculator {
  plus(x: number, y: number): Promise<number>;
}

class ClientServant {
  public async execute(): Promise<number> {
    let success: number = 0;
    await Promise.all(
      new Array(REPEAT).fill(0).map(async (_, i) => {
        try {
          await this.individual(i);
          ++success;
        } catch {}
      }),
    );
    return success;
  }

  private async individual(i: number): Promise<void> {
    const connector: WebSocketConnector<null, null, ICalculator> =
      new WebSocketConnector(null, null);
    await sleep_for(INTERVAL * i);
    await connector.connect(`ws://127.0.0.1:12345`);
    await connector.getDriver().plus(1, 2);
    await sleep_for(DELAY - INTERVAL * i);
    await connector.close();
  }
}

const main = async (): Promise<void> => {
  const worker = new WorkerServer();
  await worker.open(new ClientServant());
};
main().catch(console.error);

const REPEAT = 100;
const DELAY = 10_000;
const INTERVAL = 5;
