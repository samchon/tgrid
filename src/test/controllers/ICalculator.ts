import { Driver } from "../../basic/Driver";
import { Calculator } from "../providers/Calculator";
import { DomainError, InvalidArgument } from "tstl/exception/LogicError";

import { randint } from "tstl/algorithm/random";

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
    export async function main(driver: Driver<ICalculator>, talk: boolean = false): Promise<void>
    {
        // VALIDATOR
        let validator: Calculator = new Calculator();

        // CALL FUNCTIONS IN SERVER FROM CLIENT
        for (let i: number = 0; i < 100; ++i)
            await validate(driver, validator, talk);

        // EXCEPTION THROWN BY THE SERVER
        if (await get_exception(driver) === null)
            throw new DomainError("Throwing exception doesn't work.");
    }

    async function validate(driver: Driver<ICalculator>, validator: Calculator, talk: boolean): Promise<void>
    {
        if (driver === <any>validator)
            throw new InvalidArgument("Mistaken arguments.");

        // SPECIFY METHODS
        let method: string = METHODS[randint(0, METHODS.length - 1)];
        let x: number = randint(2, 10);
        let y: number = randint(2, 10);

        // CALL FUNCTION & GET ANSWER
        let ret: number = await eval(`driver.${method}`)(x, y);
        let answer: number = eval(`validator.${method}(x, y)`);

        if (talk === true)
            console.log(method, x, y, ret, answer);
        
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

    const METHODS: string[] = [
        "plus", "minus", "multiplies", "divides",
        "scientific.pow", "scientific.log", "scientific.sqrt",
        "statistics.mean", "statistics.stdev"
    ];
}

