import { Driver, WebConnector, WebServer } from "tgrid";
import {
  Mutex,
  Vector,
  sleep_for,
  RuntimeError,
  is_sorted,
  DomainError,
} from "tstl";

const PORT: number = 10101;
const COUNT: number = 10;
const SLEEP_TIME: number = 10;

class Provider {
  public mutex: Mutex;
  public vector: Vector<number>;
  private index_: number;

  public constructor(mutex: Mutex, vector: Vector<number>, index: number) {
    this.mutex = mutex;
    this.vector = vector;
    this.index_ = index;
  }

  public getIndex(): number {
    return this.index_;
  }
}

async function _Test_client(): Promise<void> {
  const connector: WebConnector<null, null> = new WebConnector(null, null);
  await connector.connect(`ws://127.0.0.1:${PORT}`);

  const driver: Driver<Provider> = connector.getDriver<Provider>();
  await driver.mutex.lock();
  {
    const index: number = await driver.getIndex();

    await sleep_for((COUNT - index) * SLEEP_TIME);
    await driver.vector.push_back(index);
  }
  await driver.mutex.unlock();

  await connector.close();
}

export async function test_web_mutex(): Promise<void> {
  //----
  // PREPARES
  //----
  // OPEN SERVER
  const server: WebServer<object, Provider> = new WebServer();
  const mutex: Mutex = new Mutex();
  const vector: Vector<number> = new Vector();
  let index: number = 0;

  await server.open(PORT, async (acceptor) => {
    await acceptor.accept(new Provider(mutex, vector, index++));
  });

  // PREPARE LATCH & TIME RECORDER
  const promiseList: Promise<void>[] = [];
  const time: number = Date.now();

  // CREATE CLIENTS
  for (let i: number = 0; i < COUNT; ++i) promiseList.push(_Test_client());

  // WAIT PROMISES
  await Promise.all(promiseList);

  //----
  // VALIDATIONS
  //----
  // MUTEX.LOCK CONSUMED PROPER TIME?
  if (Date.now() - time < COUNT * ((COUNT * SLEEP_TIME) / 2.0))
    throw new RuntimeError("remote mutex lock is not exact.");

  // ELEMENTS MUST BE SORTED BY THE CRITICAL SECTION
  if (is_sorted(vector.begin(), vector.end()) === false)
    throw new DomainError(
      "remote mutex lock does not ensure the critical section.",
    );

  // CLOSE THE SERVER
  await server.close();
}
