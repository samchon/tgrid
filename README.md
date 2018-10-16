# **T**ypeScript **Grid** Computing Framework
[![Build Status](https://travis-ci.org/samchon/tgrid.svg?branch=master)](https://travis-ci.org/samchon/tgrid)
[![npm version](https://badge.fury.io/js/tgrid.svg)](https://www.npmjs.com/package/tgrid)
[![Downloads](https://img.shields.io/npm/dm/tgrid.svg)](https://www.npmjs.com/package/tgrid)
[![Chat on Gitter](https://badges.gitter.im/samchon/tgrid.svg)](https://gitter.im/samchon/tgrid?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

**TGrid** is a tiny framework for *Grid Computing in TypeScript*. 

Following paradigm of the **TGrid**, you can compose real-time network communication systems very easily. Consider that system nodes are correspondent with objects. All you have to do is just calling functions in those objects with special symbol `await`.

I repeat, whether how network systems are enormous and feature are complicated, *they're just objects*. Just call functions, with the keyword `await`. It sound difficult, then look at the below [Usage - Example Code](#usage---example-code), then you may understand. If you want to know more, [Guide Documents](https://github.com/samchon/tgrid/wiki) are prepared for you.




## Installation
### NPM Module
Installing **TGrid** in *NodeJS* is very easy. Just install with the `npm` command.

```bash
# Install TGrid from the NPM module.
npm install --save tgrid
```

### Usage - Example Code
#### `example/vector/server.ts`
```typescript
import { Vector } from "tstl/container";
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

#### `example/vector/client.ts`
```typescript
import { Vector } from "tstl/container";
import { WebConnector } from "tgrid/protocol/web";

async function main(): Promise<void>
{
    let connector = new WebConnector();
    await connector.connect("ws://127.0.0.1:10101");

    let v = connector.getDriver<Vector<number>>();
    for (let i: number = 0; i < 5; ++i)
        await v.push_back(i);

    console.log("size:", await v.size());
    for (let i: number = 0; i < await v.size(); ++i)
        console.log("  element:", await v.at(i));
}
main();
```

> ```bash
> size: 5
>   element: 0
>   element: 1
>   element: 2
>   element: 3
>   element: 4
> ```




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