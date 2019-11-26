import { DomainError } from "tstl/exception/DomainError";
import { InvalidArgument } from "tstl/exception/InvalidArgument";
import { randint } from "tstl/algorithm/random";

import { Driver } from "../../components/Driver";
import { Calculator } from "../providers/Calculator";

export interface ICalculator 
    extends ISimple
{
    scientific: IScientific;
    statistics: IStatistics;
}

export interface ISimple
{
    plus(x: number, y: number): number;
    minus(x: number, y: number): number;
    multiplies(x: number, y: number): number;
    divides(x: number, y: number): number;
}
export interface IScientific
{
    pow(x: number, y: number): number;
    sqrt(x: number): number;
    log(x: number, y: number): number;
}
export interface IStatistics
{
    mean(...elems: number[]): number;
    stdev(...elems: number[]): number;
}

export namespace ICalculator
{
    export async function main(driver: Driver<ICalculator>): Promise<void>
    {
        // VALIDATOR
        let validator: Calculator = new Calculator();

        // CALL FUNCTIONS IN SERVER FROM CLIENT
        for (let i: number = 0; i < 100; ++i)
            await validate(driver, validator);

        // EXCEPTION THROWN BY THE SERVER
        if (await get_exception(driver) === null)
            throw new DomainError("Throwing exception doesn't work.");
    }

    async function validate(driver: Driver<ICalculator>, validator: Calculator): Promise<void>
    {
        if (driver === <any>validator)
            throw new InvalidArgument("Mistaken arguments.");

        // SPECIFY METHODS
        let method: IMethod = METHODS[randint(0, METHODS.length - 1)];
        let x: number = randint(2, 10);
        let y: number = randint(2, 10);

        // CALL FUNCTION & GET ANSWER
        let ret: number = await method(driver, x, y);
        let answer: number = method(validator, x, y) as number;
        
        // VALIDATE
        if (ret !== answer)
            throw new DomainError("Error on function calling.");
    }

    export async function get_exception(driver: Driver<ICalculator>): Promise<string | null>
    {
        try 
        { 
            await driver.divides(2, 0); 
        }
        catch (exp) 
        {
            return exp.message; 
        }
        return null;
    }

    const METHODS: IMethod[] = [
        (calc, x, y) => calc.plus(x, y),
        (calc, x, y) => calc.minus(x, y),
        (calc, x, y) => calc.multiplies(x, y),
        (calc, x, y) => calc.divides(x, y),
        (calc, x, y) => calc.scientific.pow(x, y),
        (calc, x, y) => calc.scientific.log(x, y),
        (calc, x) => calc.scientific.sqrt(x),
        (calc, x, y) => calc.statistics.mean(x, y),
        (calc, x, y) => calc.statistics.stdev(x, y)
    ];

    interface IMethod
    {
        (calculator: Calculator | Driver<ICalculator>, x: number, y: number): number | Promise<number>;
    }
}

