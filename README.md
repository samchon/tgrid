# TGrid
## Introduction
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/samchon/tgrid/blob/master/LICENSE)
[![npm version](https://badge.fury.io/js/tgrid.svg)](https://www.npmjs.com/package/tgrid)
[![Downloads](https://img.shields.io/npm/dm/tgrid.svg)](https://www.npmjs.com/package/tgrid)
[![Build Status](https://travis-ci.org/samchon/tgrid.svg?branch=master)](https://travis-ci.org/samchon/tgrid)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fsamchon%2Ftgrid.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fsamchon%2Ftgrid?ref=badge_shield)
[![Chat on Gitter](https://badges.gitter.im/samchon/tgrid.svg)](https://gitter.im/samchon/tgrid?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

> ```bash
> npm install --save tgrid
> ```

Full name of **TGrid** is <u>TypeScript Grid Computing Framework</u>.

As its name suggests, **TGrid** is a useful framework for implementating [Grid Computing](#12-grid-computing) in the TypeScript. With **TGrid** and its core concept [Remote Funtion Call](#13-remote-function-call), you can make many computers to be <u>a virtual computer</u>.

To know more, refer below links. If you are the first comer to the **TGrid**, I strongly recommend you to read the [Guide Documents](https://tgrid.dev). In article level, I [Basic Concepts](https://tgrid.dev/english/tutorial/concepts.html) and [Learn from Examples](https://tgrid.dev/english/tutorial/examples.html) sections would be good choices.

  - Repositories
    - [GitHub Repository](https://github.com/samchon/tgrid)
    - [NPM Repository](https://www.npmjs.com/package/tgrid)
  - Documents
    - [API Documents](https://tgrid.dev/api)
    - **Guide Documents**
      - [English](https://tgrid.dev/english)
      - [한국어](https://tgrid.dev/korean)
    - [Release Notes](https://github.com/samchon/tgrid/releases)




### 1.2. Grid Computing
<img src="https://tgrid.dev/assets/images/concepts/grid-computing.png" 
     style="max-width: 563.4px" />

> Computers be a (virtual) computer

As its name suggests, **TGrid** is a useful framework for *Grid Computing*. However, perpective of *Grid Computing* in **TGrid** is something different. It doesn't mean just combining multiple computers uinsg network communication. **TGrid** insists the real *Grid Computing* must be possible to turning multiple computers into <u>a virtual computer</u>.

Therefore, within framework of the **TGrid**, it must be possible to develop *Grid Computing* System as if there has been only a computer from the beginning. A program running on a computer and a Distributed 
Processing System with millions, both of them must have <u>similar program code</u>. It's the real *Grid Computing*.

Do you agree with me?

### 1.3. Remote Function Call
**TGrid** realizes the [Grid Computing](#12-grid-computing) through *Remote Function Call*. It literally calling remote system's functions are possible. With the *Remote Function Call*, you can access to objects of remote system as if they have been in my memory from the beginning.

With **TGrid** and *Remote Function Call*, it's possible to handle remote system's objects and functions as if they're mine from the beginning. Do you think what that sentence means? Right, being able to call objects and functions of the remote system, it means that current and remote system are integrated into a <u>single virtual computer</u>.

However, whatever [Grid Computing](#12-grid-computing) and *Remote Function Call* are, you've only heard theoretical stories. Now, it's time to see the real program code. Let's see the demonstration code and feel the *Remote Function Call*. If you want to know more about the below demonstration code, read a section [Learn from Examples](https://tgrid.dev/english/tutorial/examples.html) wrote into the [Guide Documents](https://tgrid.dev).

#### [`composite-calculator/server.ts`](https://github.com/samchon/tgrid.examples/blob/master/src/projects/composite-calculator/server.ts)
```typescript
import { WebServer, WebAcceptor } from "tgrid/protocols/web";
import { CompositeCalculator } from "../../providers/Calculator";

async function main(): Promise<void>
{
    let server: WebServer = new WebServer();
    await server.open(10102, async (acceptor: WebAcceptor) =>
    {
        await acceptor.accept(new CompositeCalculator());
    });
}
main();
```

#### [`composite-calculator/client.ts`](https://github.com/samchon/tgrid.examples/blob/master/src/projects/composite-calculator/client.ts)
```typescript
import { WebConnector } from "tgrid/protocols/web/WebConnector";
import { Driver } from "tgrid/components/Driver";

import { ICalculator } from "../../controllers/ICalculator";

async function main(): Promise<void>
{
    //----
    // CONNECTION
    //----
    let connector: WebConnector = new WebConnector();
    await connector.connect("ws://127.0.0.1:10102");

    //----
    // CALL REMOTE FUNCTIONS
    //----
    // GET DRIVER
    let calc: Driver<ICalculator> = connector.getDriver<ICalculator>();

    // FUNCTIONS IN THE ROOT SCOPE
    console.log("1 + 6 =", await calc.plus(1, 6));
    console.log("7 * 2 =", await calc.multiplies(7, 2));

    // FUNCTIONS IN AN OBJECT (SCIENTIFIC)
    console.log("3 ^ 4 =", await calc.scientific.pow(3, 4));
    console.log("log (2, 32) =", await calc.scientific.log(2, 32));

    try
    {
        // TO CATCH EXCEPTION IS STILL POSSIBLE
        await calc.scientific.sqrt(-4);
    }
    catch (err)
    {
        console.log("SQRT (-4) -> Error:", err.message);
    }

    // FUNCTIONS IN AN OBJECT (STATISTICS)
    console.log("Mean (1, 2, 3, 4) =", await calc.statistics.mean(1, 2, 3, 4));
    console.log("Stdev. (1, 2, 3, 4) =", await calc.statistics.stdev(1, 2, 3, 4));

    //----
    // TERMINATE
    //----
    await connector.close();
}
main();
```

> ```python
> 1 + 6 = 7
> 7 * 2 = 14
> 3 ^ 4 = 81
> log (2, 32) = 5
> SQRT (-4) -> Error: Negative value on sqaure.
> Mean (1, 2, 3, 4) = 2.5
> Stdev. (1, 2, 3, 4) = 1.118033988749895
> ```




## 2. Strengths
### 2.1. Easy Development
Anyone can make a network system very easily.

### 2.2. Flexible Structure
Significant changes to network systems can be handled very flexibly.

![Diagram of Composite Calculator](https://tgrid.dev/assets/images/examples/composite-calculator.png) | ![Diagram of Hierarchical Calculator](https://tgrid.dev/assets/images/examples/hierarchical-calculator.png)
:-------------------:|:-----------------------:
Composite Calculator | Hierarchical Calculator

### 2.3. Safe Implementation
Compilation and type checking help you to implement safe network system.




## 3. Block Chain
### 3.1. Business Logic
Principle components of Blockchain are simpler and easy to implement.

The core elements of Blockchain are 'Block' and 'Chain'. The first, 'Block' is a data level issue. Considers how to design the data structure and how to archive them. The second, 'Chain' is a policy issue that how to reach to an agreement when writing some data to 'Block'.

 Component | Conception     | Description
-----------|----------------|---------------------------------------
 Block     | Data Structure | Way to defining and storing data
 Chain     | Requirements   | A policy for reaching to an agreement

Let's imagine a situation that develop these 'Block' and 'Chain' onto not Network System but a single computer. In that case, those skills are required:

  - Ability to design Data Structure
  - Ability to store Data on Device
  - Ability to analyze policy (requirements)
  - Ability to implement them

Those skills are just the essentials for programmers. In other word, *Business Logic* of Blockchain is something that any skilled programmers can implement.

### 3.2. Network System
The real challenge to implementing Blockchain comes from the Distributed Processing System using Network Communication.

I said that [Business Logic](#31-business-logic) of Blockchain is easy. However, it's a conditional story only when developing the Blockchain programming running on a single computer. The actual Blockchain projects, they're not running only on a single computer, but on very large Distributed Processing System. The Distributed Processing System is composed with over millions of computers and they're interacting through network communications.

Those enormous Distributed Processing Sytems always present us tremendous difficulties. Because over millions of computers are interacting together thorugh network communication, its architecutre design must be through and perfect. There must not be any contradiction and error. If there's an error on below step, you've to roll back whole processes and start again.

  - Read Path to Hell
    - [English](https://tgrid.dev/english/appendix/swot.html#path-to-hell)
    - [한국어](https://tgrid.dev/korean/appendix/swot.html#path-to-hell)

It's tremendous difficult to develop such an actual Blockchain. No matter how simple the Business Logic is, behind it lies the path to heel, an enormous Distributed Processing System. If you want to develop a Blockchain, you've hire the excellent architects and developers, who are in the genius level. 

However, even those crazy architects and genius developers cannot assure the success. Even they can be fallen into the swamp due to incomplete requirement analyses or mistakes on architecture designs. I think those crazy difficulties may be a reason why many people and companies, who had made loud noises developing Blockchain, are quite in nowadays.

### 3.3. Conclusion
Reading the stories, it can be summarized as '[Business Logic](#31-business-logic) of Blockchain is easy, however composing its [Network System](#32-network-system) is extremely difficult'.

Do you remember? With **TGrid** and [Remote Function Call](#13-remote-function-call), you can turn multiple computers into a single virtual computer. Also, program code running on the virtual computer is similar with which runs on only one computer. Only in [Business Logic](#31-business-logic) level, two programs' codes are perfectly same. Thus, following conclusions can be drawn:

  - Blockchain's [Business Logic](#31-business-logic) is not difficult.
  - With **TGrid**, you can concentrate only on the [Business Logic](#31-business-logic).
  - Thus, you can implement Blockchain easily through **TGrid**.

Are you preparing a new Blockchain project? Then realize [Grid Computing](#12-grid-computing) with **TGrid** and [Remote Function Call](#13-remote-function-call). Focus only on the essence of the Blockchain what you want to create, [Business Logic](#31-business-logic) itself.