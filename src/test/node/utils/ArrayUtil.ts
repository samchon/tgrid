import { equal_to } from "tstl/functional/comparators";
import { randint } from "tstl/algorithm/random";

export namespace ArrayUtil
{
    export function has<T>
        (
            elements: T[], 
            target: T, 
            predicator: (x: T, y: T) => boolean = equal_to
        ): boolean
    {
        return elements.find(elem => predicator(elem, target)) !== undefined;
    }

    export function random<T>(elements: readonly T[]): T
    {
        const index: number = randint(0, elements.length - 1);
        return elements[index];
    }
}