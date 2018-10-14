# TGrid
[![Build Status](https://travis-ci.org/samchon/tgrid.svg?branch=master)](https://travis-ci.org/samchon/tgrid)
[![npm version](https://badge.fury.io/js/tgrid.svg)](https://www.npmjs.com/package/tgrid)
[![Downloads](https://img.shields.io/npm/dm/tgrid.svg)](https://www.npmjs.com/package/tgrid)
[![Chat on Gitter](https://badges.gitter.im/samchon/grid.svg)](https://gitter.im/samchon/framework?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## TypeScript Grid Computing Framework
**TGrid** is a tiny framework for Grid Computing in TypeScript. 

Following the paradigm of **TGrid**, you can compose a real-time network communication system very easily. Consider that systems are correspondent with objects. Only need for you is to calling functions in the objects with special symbol `async` & `await`.

### `example/server.ts`
```typescript
import { WebServer } from "tgrid/protocol/web";

function main(): void
{
    let server = new WebServer();
    server.open(10101, acceptor =>
    {
        acceptor.accept();
        acceptor.listen(new Vector<number>());
    });
}
main();
```

### `example/client.ts`
```typescript
import { Vector } from "tstl/container";
import { WebConnector } from "tgrid/protocol/web";

async function main(): Promise<void>
{
    let connector = new WebConnector();
    await connector.connect("ws://127.0.0.1:10101");

    let v = connector.getDriver<Vector<number>>();
    for (let i: number = 0; i < 10; ++i)
        await v.push_back(i);

    for (let i: number = 0; i < await v.size(); ++i)
        console.log(await v.at(i));
}
main();
```




## Features
### Base
### Exception
### Protocol
### Template




## References
- **Repositories**
  - [GitHub Repository](https://github.com/samchon/tgrid)
  - [NPM Repository](https://www.npmjs.com/package/tgrid)
- **Documents**
  - [**Guide Documents**](https://github.com/samchon/tgrid/wiki)
  - [API Documents](http://samchon.github.io/tgrid/api)
  - [Release Notes](https://github.com/samchon/tgrid/releases)
  - [Contribution Guide](https://github.com/samchon/tgrid/blob/master/CONTRIBUTING.md)
- **Related Projects**
  - [TSTL](https://github.com/samchon/tstl)