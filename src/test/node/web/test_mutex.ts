import { WebServer, WebConnector } from "../../../protocols/web";
import { Driver } from "../../../components/Driver";

import { Vector } from "tstl/container/Vector";
import { Mutex } from "tstl/thread/Mutex";
import { DomainError } from "tstl/exception/LogicError";
import { RuntimeError } from "tstl/exception/RuntimeError";

import { is_sorted } from "tstl/algorithm/sorting";
import { sleep_for } from "tstl/thread/global";

const PORT: number = 10101;
const COUNT: number = 10;
const SLEEP_TIME: number = 10;

class Provider
{
    public mutex: Mutex;
    public vector: Vector<number>;
    private index_: number;

    public constructor(mutex: Mutex, vector: Vector<number>, index: number)
    {
        this.mutex = mutex;
        this.vector = vector;
        this.index_ = index;
    }

    public getIndex(): number
    {
        return this.index_;
    }
}

async function _Test_client(): Promise<void>
{
    let connector = new WebConnector();
    await connector.connect(`ws://127.0.0.1:${PORT}`);

    let driver: Driver<Provider> = connector.getDriver<Provider>();
    await driver.mutex.lock();
    {
        let index: number = await driver.getIndex();

        await sleep_for((COUNT - index) * SLEEP_TIME);
        await driver.vector.push_back(index);
    }
    await driver.mutex.unlock();

    await connector.close();
}

export async function test_mutex(): Promise<void>
{
    //----
    // PREPARES
    //----
    // OPEN SERVER
    let server: WebServer = new WebServer();
    let mutex: Mutex = new Mutex();
    let vector: Vector<number> = new Vector();
    let index: number = 0;

    await server.open(PORT, async acceptor =>
    {
        await acceptor.accept(new Provider(mutex, vector, index++));
    });

    // PREPARE LATCH & TIME RECORDER
    let promiseList: Promise<void>[] = [];
    let time: number = Date.now();

    // CREATE CLIENTS
    for (let i: number = 0; i < COUNT; ++i)
        promiseList.push(_Test_client());

    // WAIT PROMISES
    await Promise.all(promiseList);

    //----
    // VALIDATIONS
    //----
    // MUTEX.LOCK CONSUMED PROPER TIME?
    if (Date.now() - time < COUNT * (COUNT * SLEEP_TIME / 2.0))
        throw new RuntimeError("remote mutex lock is not exact.");

    // ELEMENTS MUST BE SORTED BY THE CRITICAL SECTION
    if (is_sorted(vector.begin(), vector.end()) === false)
    {
        console.log(vector.data());
        throw new DomainError("remote mutex lock does not ensure the critical section.");
    }

    // CLOSE THE SERVER
    await server.close();
}