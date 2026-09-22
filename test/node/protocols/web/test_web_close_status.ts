import {
  WebSocketAcceptor,
  WebSocketConnector,
  WebSocketError,
  WebSocketServer,
} from "tgrid";

const PORT: number = 10175;

interface IWaiter {
  wait(): Promise<void>;
}

interface IReady {
  ready(): void;
}

function never(): Promise<void> {
  return new Promise(() => {});
}

function create_waiter(start: () => void): IWaiter {
  return {
    wait: () => {
      start();
      return never();
    },
  };
}

function wait_for_error(promise: Promise<Error>): Promise<Error> {
  return new Promise((resolve, reject) => {
    const timer: NodeJS.Timeout = setTimeout(
      () => reject(new Error("Timed out waiting for the close error.")),
      1000,
    );
    promise.then(
      (error) => {
        clearTimeout(timer);
        resolve(error);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

async function test_client_close(code?: number): Promise<Error> {
  let resolveError!: (error: Error) => void;
  let resolveReady!: () => void;
  let resolveStarted!: () => void;
  const error: Promise<Error> = new Promise(
    (resolve) => (resolveError = resolve),
  );
  const started: Promise<void> = new Promise(
    (resolve) => (resolveStarted = resolve),
  );
  const ready: Promise<void> = new Promise(
    (resolve) => (resolveReady = resolve),
  );

  const server: WebSocketServer<null, IReady, IWaiter> = new WebSocketServer();
  await server.open(PORT, async (acceptor) => {
    await acceptor.accept({ ready: resolveReady });
    await ready;
    acceptor.getDriver<IWaiter>().wait().catch(resolveError);
  });

  const connector: WebSocketConnector<null, IWaiter, IReady> =
    new WebSocketConnector(null, {
      wait: () => {
        resolveStarted();
        return never();
      },
    });
  await connector.connect(`ws://127.0.0.1:${PORT}`);
  await connector.getDriver<IReady>().ready();
  await started;
  await connector.close(code);

  const result: Error = await wait_for_error(error);
  await server.close();
  return result;
}

async function test_server_close(code?: number): Promise<Error> {
  let acceptor!: WebSocketAcceptor<null, IWaiter, null>;
  let resolveError!: (error: Error) => void;
  let resolveStarted!: () => void;
  const error: Promise<Error> = new Promise(
    (resolve) => (resolveError = resolve),
  );
  const started: Promise<void> = new Promise(
    (resolve) => (resolveStarted = resolve),
  );

  const server: WebSocketServer<null, IWaiter, null> = new WebSocketServer();
  await server.open(PORT, async (a) => {
    acceptor = a;
    await acceptor.accept(create_waiter(resolveStarted));
  });

  const connector: WebSocketConnector<null, null, IWaiter> =
    new WebSocketConnector(null, null);
  await connector.connect(`ws://127.0.0.1:${PORT}`);
  connector.getDriver<IWaiter>().wait().catch(resolveError);
  await started;

  await acceptor.close(code);
  const result: Error = await wait_for_error(error);
  await server.close();
  return result;
}

async function test_default_reject(): Promise<void> {
  const server: WebSocketServer<null, null, null> = new WebSocketServer();
  await server.open(PORT, async (acceptor) => {
    await acceptor.reject();
  });

  const connector: WebSocketConnector<null, null, null> =
    new WebSocketConnector(null, null);
  let error: unknown = null;
  try {
    await connector.connect(`ws://127.0.0.1:${PORT}`);
  } catch (exp) {
    error = exp;
  }

  if (!(error instanceof WebSocketError) || error.status !== 1000)
    throw new Error("A default rejection did not use the normal close code.");
  await server.close();
}

async function test_server_shutdown(): Promise<void> {
  let resolveStarted!: () => void;
  let resolveError!: (error: Error) => void;
  const started: Promise<void> = new Promise(
    (resolve) => (resolveStarted = resolve),
  );
  const error: Promise<Error> = new Promise(
    (resolve) => (resolveError = resolve),
  );

  const server: WebSocketServer<null, IWaiter, null> = new WebSocketServer();
  await server.open(PORT, async (acceptor) => {
    await acceptor.accept(create_waiter(resolveStarted));
  });

  const connector: WebSocketConnector<null, null, IWaiter> =
    new WebSocketConnector(null, null);
  await connector.connect(`ws://127.0.0.1:${PORT}`);
  connector.getDriver<IWaiter>().wait().catch(resolveError);
  await started;

  await server.close();
  const result: Error = await wait_for_error(error);
  if (!(result instanceof WebSocketError) || result.status !== 1001)
    throw new Error("Server shutdown did not use the going-away close code.");
}

export async function test_web_close_status(): Promise<void> {
  for (const code of [undefined, 1000]) {
    const clientError: Error = await test_client_close(code);
    if (clientError instanceof WebSocketError)
      throw new Error(
        `Client normal close(${code ?? "default"}) was treated as an error.`,
      );

    const serverError: Error = await test_server_close(code);
    if (serverError instanceof WebSocketError)
      throw new Error(
        `Server normal close(${code ?? "default"}) was treated as an error.`,
      );
  }

  for (const close of [test_client_close, test_server_close]) {
    const error: Error = await close(1008);
    if (!(error instanceof WebSocketError) || error.status !== 1008)
      throw new Error("An abnormal close did not preserve its status code.");
  }

  await test_default_reject();
  await test_server_shutdown();
}
