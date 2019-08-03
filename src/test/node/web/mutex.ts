import { WebServer, WebConnector } from "../../../protocols/web";

import { Vector } from "tstl/container/Vector";
import { Mutex } from "tstl/thread/Mutex";
import { Latch } from "tstl/experimental/thread/Latch";
import { DomainError } from "tstl/exception/LogicError";
import { RuntimeError } from "tstl/exception/RuntimeError";

import { is_sorted } from "tstl/algorithm/sorting";
import { sleep_for } from "tstl/thread/global";

const PORT: number = 10101;
const COUNT: number = 10;
const SLEEP_TIME: number = 10;

class Provider
{
    public mutex: Mutex = new Mutex();
    public vector: Vector<number> = new Vector();
}

export async function test_mutex(): Promise<void>
{
    //----
    // PREPARES
    //----
    // OPEN SERVER
    let server = new WebServer();
    let provider = new Provider();

    await server.open(PORT, async acceptor =>
    {
        await acceptor.accept(provider);
    });

    // PREPARE LATCH & TIME RECORDER
    let latch = new Latch(COUNT);
    let time = Date.now();

    // CREATE CLIENTS
    for (let i: number = 0; i < COUNT; ++i)
        _Test_client(latch, i);

    // WAIT LATCH TO BE BROKEN
    await latch.wait();

    //----
    // VALIDATIONS
    //----
    // MUTEX.LOCK CONSUMED PROPER TIME?
    if (Date.now() - time < COUNT * (COUNT * SLEEP_TIME / 2.0))
        throw new RuntimeError("remote mutex lock is not exact.");

    // ELEMENTS MUST BE SORTED BY THE CRITICAL SECTION
    if (is_sorted(provider.vector.begin(), provider.vector.end()) === false)
        throw new DomainError("remote mutex lock does not ensure the critical section.");

    // CLOSE THE SERVER
    await server.close();
}

async function _Test_client(latch: Latch, index: number): Promise<void>
{
    let connector = new WebConnector();
    await connector.connect(`ws://127.0.0.1:${PORT}`);

    let driver = connector.getDriver<Provider>();
    await driver.mutex.lock();
    {
        await sleep_for((COUNT - index) * SLEEP_TIME);
        await driver.vector.push_back(index);
    }
    await driver.mutex.unlock();
    await latch.arrive();

    await connector.close();
}