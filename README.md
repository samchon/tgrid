# TGrid
![TGrid logo](https://private-user-images.githubusercontent.com/13158709/329786980-42e584e9-bede-4879-b416-627060a21ef6.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MTU0MzY0NzIsIm5iZiI6MTcxNTQzNjE3MiwicGF0aCI6Ii8xMzE1ODcwOS8zMjk3ODY5ODAtNDJlNTg0ZTktYmVkZS00ODc5LWI0MTYtNjI3MDYwYTIxZWY2LnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNDA1MTElMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjQwNTExVDE0MDI1MlomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTU4OTEwNzEzMjc3NGExOWE2ZTM4OTdlYmViYjE1MTI2Y2VkN2FmMGM4ZDgxZWNkY2Q4MDE0Mjg0OGQ3ZGJhNmEmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0JmFjdG9yX2lkPTAma2V5X2lkPTAmcmVwb19pZD0wIn0.TNb9oEvZpawGXAJ9heHAcp9jZMleFUK1SIK_PYZHYig)

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/samchon/tgrid/blob/master/LICENSE)
[![npm version](https://badge.fury.io/js/tgrid.svg)](https://www.npmjs.com/package/tgrid)
[![Downloads](https://img.shields.io/npm/dm/tgrid.svg)](https://www.npmjs.com/package/tgrid)
[![Build Status](https://github.com/samchon/tgrid/workflows/build/badge.svg)](https://github.com/samchon/tgrid/actions?query=workflow%3Abuild)
[![Guide Documents](https://img.shields.io/badge/guide-documents-forestgreen)](https://tgrid.com/docs)

TypeScript Grid Computing Framework.

TypeScript RPC (Remote Procedure Call) framework for WebSocket and Worker protocols. 

Also, extremely easy even when composing complicated network system like grid computing.

```typescript
import { Driver, WebSocketConnector } from "tgrid";
import { ICalculator } from "./interfaces/ICalculator";

export const main = async (): Promise<void> => {
  const connector: WebSocketConnector<null, null, ICalculator> =
    new WebSocketConnector(null, null);
  await connector.connect("ws://127.0.0.1:443/calculator");
  
  const remote: Driver<ICalculator> = connector.getDriver();
  console.log(
    await remote.plus(2, 3),
    await remote.minus(7, 1),
    await remote.multiplies(3, 4),
    await remote.divides(9, 3),
  );
  await connector.close();
};
```




## Setup
```bash
npm install tgrid
```

Just install with `npm` command. That's all.

If you're using `tgrid` with `nestia`, reference `nestia` guide documents.

  - [Nestia > Guide Documents > Setup](https://nestia.io/docs/setup/)
  - [Nestia > Guide Documents > WebSocketRoute](https://nestia.io/docs/core/WebSocketRoute/)



## Guide Documents
Check out the document in the [website](https://tgrid.com/docs):

### 🏠 Home
  - [Introduction](https://tgrid.com/docs)
  - [Setup](https://tgrid.com/docs/setup)
  - [Remote Procedure Call](https://tgrid.com/docs/remote-procedure-call)

### 📖 Tutorial
  - Features
    - [Components](https://tgrid.com/docs/features/components)
    - [Worker Protocol](https://tgrid.com/docs/features/worker)
    - [WebSocket Protocol](https://tgrid.com/docs/features/websocket)
    - [NestJS WebSocket](https://tgrid.com/docs/features/nestjs)
  - Learn from Examples
    - [Remote Function Call](https://tgrid.com/docs/examples/remote-function-call)
    - [Remote Object Call](https://tgrid.com/docs/examples/remote-object-call)
    - [Object Oriented Network](https://tgrid.com/docs/examples/object-oriented-network)
    - [NestJS WebSocket](https://tgrid.com/docs/examples/nestjs)
  - Learn from Projects
    - [Chat Application](https://tgrid.com/docs/projects/chat)
    - [Grid Market](https://tgrid.com/docs/examples/market)

### 🔗 Appendix
  - [API Documents](https://tgrid.com/api)