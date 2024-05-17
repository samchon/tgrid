# TGrid
![TGrid logo](https://tgrid.com/logo.png)

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/samchon/tgrid/blob/master/LICENSE)
[![npm version](https://badge.fury.io/js/tgrid.svg)](https://www.npmjs.com/package/tgrid)
[![Downloads](https://img.shields.io/npm/dm/tgrid.svg)](https://www.npmjs.com/package/tgrid)
[![Build Status](https://github.com/samchon/tgrid/workflows/build/badge.svg)](https://github.com/samchon/tgrid/actions?query=workflow%3Abuild)
[![Guide Documents](https://img.shields.io/badge/guide-documents-forestgreen)](https://tgrid.com/docs)

TypeScript Grid Computing Framework.

TypeScript RPC (Remote Procedure Call) framework for `WebSocket` and `Worker` protocols. 

  - `WebSocket`
  - `Worker`
  - `SharedWorker`
  - `NestJS`

Also, easy to develop complicated network system like grid computing.

```typescript
import { Driver, WebSocketConnector } from "tgrid";

import { ICalculator } from "./ICalculator";

export const webSocketClientMain = async () => {
  // CONNECT TO WEBSOCKET SERVER
  const connector: WebSocketConnector<null, null, ICalculator> =
    new WebSocketConnector(
      null, // header
      null, // provider for remote server
    );
  await connector.connect("ws://127.0.0.1:37000/composite");

  // CALL REMOTE FUNCTIONS
  const remote: Driver<ICalculator> = connector.getDriver();
  console.log(
    await remote.plus(10, 20), // returns 30
    await remote.minus(7, 3), // returns 4
    await remote.multiply(3, 4), // returns 12
    await remote.divide(5, 2), // returns 2.5
  );
  await connector.close();
};

interface ICalculator {
  plus(a: number, b: number): number
  minus(a: number, b: number): number
  multiply(a: number, b: number): number
  divide(a: number, b: number): number
}
```

> ```bash
> $ npm start
> 30 4 12 2.5
> ```




## Setup
```bash
npm install tgrid
```

Just install with `npm` command. That's all.

If you wanna use `TGrid` in `NestJS`, read `Nestia` guide documents, too.

  - [TGrid > Guide Documents > Setup](https://tgrid.com/docs/setup/)
  - [Nestia > Guide Documents > Setup](https://nestia.io/docs/setup/)
  - [Nestia > Guide Documents > WebSocketRoute](https://nestia.io/docs/core/WebSocketRoute/)




## Playground
You can quickly experience `TGrid` on the playground websites:

  - [Remote Function Call](https://stackblitz.com/~/github.com/samchon/tgrid.example.remote-function-call?file=src/client.ts&view=editor)
  - [Remote Object Call](https://stackblitz.com/~/github.com/samchon/tgrid.example.remote-object-call?file=src/client.ts&view=editor)
  - [Object Oriented Network](https://stackblitz.com/~/github.com/samchon/tgrid.example.object-oriented-network?file=src/composite.ts&view=editor)
  - [WebSocket Protocool](https://stackblitz.com/~/github.com/samchon/tgrid.example.websocket?file=src/client.ts&view=editor)
  - [Worker Protocol](https://stackblitz.com/~/github.com/samchon/tgrid.example.worker?file=src/client.ts&view=editor)
  - [NestJS WebSocket](https://stackblitz.com/~/github.com/samchon/tgrid.example.nestjs?file=src/calculate.test.ts&view=editor)


## Guide Documents
Check out the document in the [website](https://tgrid.com/docs):

### 🏠 Home
  - [Introduction](https://tgrid.com/docs)
  - [Remote Procedure Call](https://tgrid.com/docs/remote-procedure-call)
  - [Setup](https://tgrid.com/docs/setup)

### 📖 Tutorial
  - Features
    - [Components](https://tgrid.com/docs/features/components)
    - [WebSocket Protocol](https://tgrid.com/docs/features/websocket)
    - [Worker Protocol](https://tgrid.com/docs/features/worker)
  - Learn from Examples
    - [Remote Function Call](https://tgrid.com/docs/examples/remote-function-call)
    - [Remote Object Call](https://tgrid.com/docs/examples/remote-object-call)
    - [Object Oriented Network](https://tgrid.com/docs/examples/object-oriented-network)
    - [NestJS WebSocket](https://tgrid.com/docs/examples/nestjs-websocket)
  - Learn from Projects
    - [Chat Application](https://tgrid.com/docs/projects/chat)
    - [Grid Market](https://tgrid.com/docs/projects/market)
    - [Mutex Server](https://tgrid.com/docs/projects/mutex)

### 🔗 Appendix
  - [API Documents](https://tgrid.com/api)