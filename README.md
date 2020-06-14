# TGrid
## Introduction
![Flag](https://tgrid.com/assets/images/flag.png)

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/samchon/tgrid/blob/master/LICENSE)
[![npm version](https://badge.fury.io/js/tgrid.svg)](https://www.npmjs.com/package/tgrid)
[![Downloads](https://img.shields.io/npm/dm/tgrid.svg)](https://www.npmjs.com/package/tgrid)
[![Build Status](https://github.com/samchon/tgrid/workflows/build/badge.svg)](https://github.com/samchon/tgrid/actions?query=workflow%3Abuild)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fsamchon%2Ftgrid.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fsamchon%2Ftgrid?ref=badge_shield)
[![Chat on Gitter](https://badges.gitter.im/samchon/tgrid.svg)](https://gitter.im/samchon/tgrid?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Full name of **TGrid** is <u>TypeScript Grid Computing Framework</u>.

As its name suggests, **TGrid** is a useful framework for implementating [Grid Computing](#12-grid-computing) in the TypeScript. With **TGrid** and its core concept [Remote Funtion Call](#13-remote-function-call), you can make many computers to be <u>a virtual computer</u>.

To know more, refer below links. If you are the first comer to the **TGrid**, I strongly recommend you to read the [Guide Documents](https://tgrid.com). In article level, I [Basic Concepts](https://tgrid.com/en/tutorial/concepts.html) and [Learn from Examples](https://tgrid.com/en/tutorial/examples.html) sections would be good choices.

  - Repositories
    - [GitHub Repository](https://github.com/samchon/tgrid)
    - [NPM Repository](https://www.npmjs.com/package/tgrid)
  - Documents
    - [API Documents](https://tgrid.com/api)
    - **Guide Documents**
      - [English](https://tgrid.com/en)
      - [한국어](https://tgrid.com/ko)
    - [Release Notes](https://github.com/samchon/tgrid/releases)




### 1.2. Grid Computing
![Grid Computing](https://tgrid.com/assets/images/concepts/grid-computing.png)

> Computers be a (virtual) computer

As its name suggests, **TGrid** is a useful framework for *Grid Computing*. However, perpective of *Grid Computing* in **TGrid** is something different. It doesn't mean just combining multiple computers uinsg network communication. **TGrid** insists the real *Grid Computing* must be possible to turning multiple computers into <u>a virtual computer</u>.

Therefore, within framework of the **TGrid**, it must be possible to develop *Grid Computing* System as if there has been only a computer from the beginning. A program running on a computer and a Distributed 
Processing System with millions, both of them must have <u>similar program code</u>. It's the real *Grid Computing*.

Do you agree with me?

### 1.3. Remote Function Call
**TGrid** realizes the [Grid Computing](#12-grid-computing) through *Remote Function Call*. It literally calling remote system's functions are possible. With the *Remote Function Call*, you can access to objects of remote system as if they have been in my memory from the beginning.

With **TGrid** and *Remote Function Call*, it's possible to handle remote system's objects and functions as if they're mine from the beginning. Do you think what that sentence means? Right, being able to call objects and functions of the remote system, it means that current and remote system are integrated into a <u>single virtual computer</u>.

However, whatever [Grid Computing](#12-grid-computing) and *Remote Function Call* are, you've only heard theoretical stories. Now, it's time to see the real program code. Let's see the demonstration code and feel the *Remote Function Call*. If you want to know more about the below demonstration code, read a section [Learn from Examples](https://tgrid.com/en/tutorial/examples.html) wrote into the [Guide Documents](https://tgrid.com).

#### [`composite-calculator/server.ts`](https://github.com/samchon/tgrid.examples/blob/master/src/projects/composite-calculator/server.ts)
```typescript
import { WebServer } from "tgrid/protocols/web";
import { CompositeCalculator } from "../../providers/Calculator";

async function main(): Promise<void>
{
    let server: WebServer<{}, CompositeCalculator> = new WebServer();
    await server.open(10102, async acceptor =>
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
    let connector: WebConnector<{}, null> = new WebConnector(null);
    await connector.connect("ws://127.0.0.1:10102", {});

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




<!-- 
must define those templates

  - chapter
  - assets
  - blockchain.md
  - examples.md
  - Grid Computing
  - Remote Function Call

-->

## 2. Strengths
### 2.1. Easy Development
Anyone can easily make a network system.

It's difficult to make network system because many of computers are interacting together to accomplish a common task. Therefore, the word 'perfect' is inserted on every development processes; requirements must be analyzed perfectly, use-cases must be identified perfectly, data and network architectures must be designed, perfectly and mutual interaction test must be perfectly.

> #### Something to Read
> [Blockchain's Network System, Steps to Hell](https://tgrid.com/en/appendix/blockchain.html#steps-to-hell)
> 
> ![Difficulty Level Graph](https://tgrid.com/assets/images/appendix/difficulty_level_graph.png)

However, with TGrid and [Remote Function Call](#13-remote-function-call), you can come true the true [Grid Computing](#12-grid-computing). Many computers interacting with network communication are replaced by only <u>one virtual computer</u>. Even *Business Logic* code of the virtual computer is same with another *Business Logic* code running on a single physical computer.

Thus, you can make a network system very easily if you use the **TGrid**. Forget everything about the network; protocolcs and designing message structures, etc. You only concentrate on the *Business Logic*, the essence of what you want to make. Remeber that, as long as you use the TGrid, you're just making a single program running on a single (virtual) computer.

### 2.2. Safe Implementation
By compilation and type checking, you can make network system safe.

When developing a distributed processing system with network communication, one of the most embarrassing thing for developers is the run-time error. Whether network messages are correctly constructed and exactly parsed, all can be detected at the run-time, not the compile-time.

Let's assume a situation; There's a distributed processing system build by traditional method and there's a critical error on the system. Also, the critical error wouldn't be detected until the service starts. How terrible it is? To avoid such terrible situation, should we make a test program validating all of the network messages and all of the related scenarios? If compilation and type checking was supported, everything would be simple and clear.

**TGrid** provides exact solution about this compilation issue. TGrid has invented [Remote Function Call](#13-remote-function-call) to come true the real [Grid Computing](#12-grid-computing). What the [Remote Function Call](#13-remote-function-call) is? Calling functions remotly, isn't it a function call itself? Naturally, the function call is protected by *TypeScript Compilter*, therefore guarantees the *Type Safety*.

Thus, with **TGrid** and [Remote Function Call](#13-remote-function-call), you can adapt compilation and type checking on the network system. It helps you to develop a network system safely and conveniently. Let's close this chapter with an example of *Safey Implementation*.

```typescript
import { WebConnector } from "tgrid/protocols/web/WebConnector"
import { Driver } from "tgrid/components/Driver";

interface ICalculator
{
    plus(x: number, y: number): number;
    minus(x: number, y: number): number;

    multiplies(x: number, y: number): number;
    divides(x: number, y: number): number;
    divides(x: number, y: 0): never;
}

async function main(): Promise<void>
{
    //----
    // CONNECTION
    //----
    let connector: WebConnector<{}, null> = new WebConnector(null);
    await connector.connect("ws://127.0.0.1:10101", {});

    //----
    // CALL REMOTE FUNCTIONS
    //----
    // GET DRIVER
    let calc: Driver<ICalculator> = connector.getDriver<ICalculator>();

    // CALL FUNCTIONS REMOTELY
    console.log("1 + 6 =", await calc.plus(1, 6));
    console.log("7 * 2 =", await calc.multiplies(7, 2));

    // WOULD BE COMPILE ERRORS
    console.log("1 ? 3", await calc.pliuowjhof(1, 3));
    console.log("1 - 'second'", await calc.minus(1, "second"));
    console.log("4 / 0", await calc.divides(4, 0));
}
main();
```

> ```bash
> $ tsc
> src/index.ts:33:37 - error TS2339: Property 'pliuowjhof' does not exist on type 'Driver<ICalculator>'.
> 
>     console.log("1 ? 3", await calc.pliuowjhof(1, 3));
> 
> src/index.ts:34:53 - error TS2345: Argument of type '"second"' is not assignable to parameter of type 'number'.
> 
>     console.log("1 - 'second'", await calc.minus(1, "second"));
> 
> src/index.ts:35:32 - error TS2349: Cannot invoke an expression whose type lacks a call signature. Type 'never' has no compatible call signatures.
> 
>     console.log("4 / 0", await calc.divides(4, 0));
> ```

### 2.3. Network Refactoring
Critical changes on network systems can be resolved flexibly.

In most case of developing network distributed processing system, there can be an issue that, necessary to major change on the network system. In someday, neccessary to *refactoring* in network level would be come, like software refactoring.

The most representative of that is the *performance* issue. For an example, there is a task and you estimated that the task can be done by one computer. However, when you actually started the service, the computation was so large that one computer was not enough. Thus, you should distribute the task to multiple computers. On contrary, you prepared multiple computers for a task. However, when you actually started the service, the computation was so small that just one computer is sufficient for the task. Sometimes, assigning a computer is even excessive, so you might need to merge the task into another computer.

![Diagram of Composite Calculator](https://tgrid.com/assets/images/examples/composite-calculator.png) | ![Diagram of Hierarchical Calculator](https://tgrid.com/assets/images/examples/hierarchical-calculator.png)
:-------------------:|:-----------------------:
[Composite Calculator](https://tgrid.com/en/tutorial/examples.html#22-remote-object-call) | [Hierarchical Calculator](https://tgrid.com/en/tutorial/examples.html#23-object-oriented-network)

I'll explain this *Network Refactoring*, caused by performance issue, through an example case that is very simple and clear. In a distributed processing system, there was a computer that providing a calculator. However, when this system was actually started, amount of the computations was so enormous that the single computer couldn't afford the computations. Thus, decided to separate the computer to three computers.


  - [`scientific`](https://tgrid.com/en/tutorial/examples.html#hierarchical-calculatorscientificts): scientific calculator server
  - [`statistics`](https://tgrid.com/en/tutorial/examples.html#hierarchical-calculatorstatisticsts): statistics calculator server
  - [`calculator`](https://tgrid.com/en/tutorial/examples.html#hierarchical-calculatorcalculatorts): mainframe server
    - four arithmetic operations are computed by itself
    - scientific and statistics operations are shifted to another computers
    - and intermediates the computation results to client

If you solve this *Network Refactoring* by traditional method, it would be a hardcore duty. At first, you've to design a message protocol used for neetwork communication between those three computers. At next, you would write parsers for the designed network messges and reprocess the events according to the newly defined network architecture. Finally, you've to also prepare the verifications for those developments.

> Things to be changed
>  - Network Architecture
>  - Message Protocol
>  - Event Handling
>  - *Business Logic* Code

However, if you use the **TGrid** and [Remote Function Call](#13-remote-function-call), the issue can't be a problem. In the **TGrid**, each computer in the network system is just one object. Whether you implement the remote calculator in one computer or distribute operations to three computers, its *Business Logic* code must be the same, in always.

I also provide you the best example for this *performance* issue causing the *Network Refactoring*. The first demonstration code is an implementation of a single calculator server and the second demonstration code is an implementation of a system distributing operations to three servers. As you can see, although principle structure of network system has been changed, you don't need to worry about it if you're using the **TGrid** and [Remote Function Call](#13-remote-function-call).

  - [Demonstration - Remote Object Call](https://tgrid.com/en/tutorial/examples.html#22-remote-object-call)
  - [Demonstration - Object Oriented Network](https://tgrid.com/en/tutorial/examples.html#23-object-oriented-network)





## 3. Opportunities
### 3.1. Blockchain
> Detailed Content: [**Appendix** > **Blockchain**](https://tgrid.com/en/appendix/blockchain.html)

With **TGrid**, you can develop *Blockchain* easily.

It's a famous story that difficulty of developing blockchain is very high. Not only because of the high wages of the blockchain developers, but also from a technical point of view, blockchain is actually very difficult to implement. But, if you ask me what is such difficult, I will answer that not Business Logic* but *Network System*.

The [Network System](https://tgrid.com/en/appendix/blockchain.html#2-network-system) used by blockchain is a type of great distributed processing system, conostructed by millions of computers interacting with network communication. The great distributed processing systems like the blockchain always present us the tremendous difficulties. The word 'perfect' is inserted on every development processes; requirements must be analyzed perfectly, use-cases must be identified perfectly, data and network architectures must be designed, perfectly and mutual interaction test must be perfectly.

On contrary, [Business Logic](https://tgrid.com/en/appendix/blockchain.html#3-business-logic) of the blockchain is not such difficult. Core elements of the blockchain are, as the name suggest, the first is 'Block' and the second is 'Chain'. The 'Block' is about defining and storing data and the 'Chain' is about policy that how to reach to an agreement when writing data to the 'Block'.

 Component | Conception     | Description
-----------|----------------|---------------------------------------
 Block     | Data Structure | Way to defining and storing data
 Chain     | Requirements   | A policy for reaching to an agreement

Let's assume that you are developing the 'Block' and 'Chain' as a program running only on a single computer. In this case, you just need to design the data structure and implement code storing the data on disk. Also, you would analyze the requirements (policy) and implement them. Those skills are just the essentials for programmers. In other word, [Business Logic](https://tgrid.com/en/appendix/blockchain.html#3-business-logic) of blockchain is something that any skilled programmers can implement.

  - To develop the *Block* and *Chain*:
    - Ability to design Data Structure
    - Ability to store Data on Device
    - Ability to analyze policy (requirements)
    - Ability to implement them

Do you remember? With **TGrid** and [Remote Function Call](#13-remote-function-call), you can come true the true [Grid Computing](#12-grid-computing). Many computers interacting with network communication are replaced by only <u>one virtual computer</u>. Even [Business Logic](https://tgrid.com/en/appendix/blockchain.html#2-network-system) code of the virtual computer is same with another [Business Logic](https://tgrid.com/en/appendix/blockchain.html#2-network-system) code running on a single physical computer.

Thus, if you adapt the **TGrid** and [Remote Function Call](#13-remote-function-call), difficulty of the blockchain development would be dropped to the level of [Business Logic](https://tgrid.com/en/appendix/blockchain.html rather than [Network System](https://tgrid.com/en/appendix/blockchain.html#2-network-system). Forget complex [Network System](https://tgrid.com/en/appendix/blockchain.html#2-network-system) and just focus on the essence of what you want to develop; the [Business Logic](https://tgrid.com/en/appendix/blockchain.html.

### 3.2. Public Grid
> Related Project: [**Tutorial** > **Projects** > **Grid Market**](https://tgrid.com/en/tutorial/projects/market.html)

With **TGrid**, you can procure resources for [Grid Computing](#12-grid-computing) from unspecified crowds, very easily and inexpensively.

When composing *traditional Grid Computing*, of course, many computers should be prepared. As the number of computers required increases, so does the infrastructure and costs associated with procuring them. Also, you've to install programs and configure settings for the network communication on the prepared computers. Such duties increase your efforts and let you to be tired. Is it so nature?

Name | Consumer                              | Supplier
-----|---------------------------------------|-------------------------------
Who  | Developer of [Grid Computing](#12-grid-computing)    | Unspecified crowds connecting to the Internet
What | Consumes resources of the *Suppliers* | Provides resources to *Consumer*
How  | Deliver program code to *Suppliers*   | Connect to special URL by Internet Browser

However, TGrid even can economize such costs and efforts dramatically. You can procure resources for [Grid Computing](#12-grid-computing) from the unspecified crowds. Those unspecified crowds do not need to prepare anything like installing some program or configuring some setting. The only need those unspecified crowds is just connecting to special URL by Internet Browser.

The program that each *Supplier* should run is provided by the *Consumer* as JavaScript code. Each *Supplier* would act its role by the JavaScript code. Of course, interactions with *Supplier* and *Consumer* (or with a third-party computer) would use the [Remote Function Call](#13-remote-function-call), so they are just one virtual computer.

> Base language of the **TGrid** is *TypeScript* and compilation result of the TypeScript is the *JavaScript* file. As *JavaScript* is a type of script language, it can be executed dinamiccaly. Therefore, the *Supplier* can execute the program by script code delivered by the *Consumer*.

![Grid Market](https://tgrid.com/assets/images/projects/market/actors.png)

[Grid Market](https://tgrid.com/en/tutorial/projects/market.html) is one of the most typical example case for the *Public Grid*, a demo project for tutorial learning. In this demo project, *Consumer* also procures resources from the *Suppliers* for composing the [Grid Computing](#12-grid-computing) system. *Supplier* also provides its resources just by connecting to the special URL by Internet Browser, too. Of course, in the [Grid Market](https://tgrid.com/en/tutorial/projects/market.html), the program that *Supplier* would run still comes from the *Consumer*.

However, there's a special thing about the [Grid Market](https://tgrid.com/en/tutorial/projects/market.html), it is that there is a *cost* for the *Consumer* to procure the *Suppliers*' resources. Also, intermediary *Market* exists and it charges fee for mediation between the *Consumer* and *Supplier*.

  - `Market`: Intermediary market for the *Suppliers* and *Consumers*.
  - `Consumer`: Purchase resources from the *Suppliers.
  - `Supplier`: Sells its own resources to the *Consumer*.

### 3.3. Market Expansions
The [Grid Computing](#12-grid-computing) market would be grown up day by day.

The future belongs to those who prepare. Prepare the future by **TGrid** and [Remote Function Call](#13-remote-function-call). Also, I hope you to hold some changes from the future.