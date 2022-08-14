import { Driver } from "../../components/module";

import { DomainError } from "tstl/exception/DomainError";
import { randint } from "tstl/algorithm/random";

export interface IVector<T> {
    size(): T;
    at(index: number): T;
    set(index: number, val: T): void;
    push_back(val: T): void;
}

export namespace IVector {
    export async function main(driver: Driver<IVector<number>>): Promise<void> {
        let mySum: number = 0;
        let serverSum: number = 0;

        for (let i: number = 0; i < 10; ++i) {
            const val: number = randint(1, 10);

            mySum += val;
            await driver.push_back(val);
        }

        for (let i: number = 0; i < (await driver.size()); ++i)
            serverSum += await driver.at(i);

        if (mySum !== serverSum)
            throw new DomainError("Error on function returning.");
    }
}
