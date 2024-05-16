# TGrid
![TGrid logo](https://tgrid.com/og.jpg)

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

Also, extremely easy even when composing complicated network system like grid computing.

```typescript
import { Driver, WebSocketConnector } from "tgrid";

import { ICalcConfig } from "../interfaces/ICalcConfig";
import { ICalcEvent } from "../interfaces/ICalcEvent";
import { ICalcEventListener } from "../interfaces/ICalcEventListener";
import { ICompositeCalculator } from "../interfaces/ICompositeCalculator";

export const webSocketClientMain = async () => {
  const stack: ICalcEvent[] = [];
  const listener: ICalcEventListener = {
    on: (evt: ICalcEvent) => stack.push(evt),
  };
  const connector: WebSocketConnector<
    ICalcConfig,
    ICalcEventListener,
    ICompositeCalculator
  > = new WebSocketConnector(
    { precision: 2 }, // header
    listener, // provider for remote server
  );
  await connector.connect("ws://127.0.0.1:37000/composite");

  const remote: Driver<ICompositeCalculator> = connector.getDriver();
  console.log(
    await remote.plus(10, 20), // returns 30
    await remote.multiplies(3, 4), // returns 12
    await remote.divides(5, 3), // returns 1.67
    await remote.scientific.sqrt(2), // returns 1.41
    await remote.statistics.mean(1, 3, 9), // returns 4.33
  );

  await connector.close();
  console.log(stack);
};
```

> [!TIP]
> ```bash
> $ npx ts-node examples/src/websocket
> 30 12 1.67 1.41 4.33
> [
>   { type: 'plus', input: [ 10, 20 ], output: 30 },
>   { type: 'multiplies', input: [ 3, 4 ], output: 12 },
>   { type: 'divides', input: [ 5, 3 ], output: 1.67 },
>   { type: 'sqrt', input: [ 2 ], output: 1.41 },
>   { type: 'mean', input: [ 1, 3, 9 ], output: 4.33 }
> ]
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