import * as std from "tstl";

import { Promisify } from "../../base/Promisify";
import { Calculator } from "./Calculator";

export type ICalculator = Promisify<Calculator>;

export namespace ICalculator
{
	export async function main(driver: ICalculator): Promise<void>
	{
		// VALIDATOR
		let validator: Calculator = new Calculator();

		// CALL FUNCTIONS IN SERVER FROM CLIENT
		for (let i: number = 0; i < 5; ++i)
			validate(driver, validator);

		// EXCEPTION THROWN BY THE SERVER
		if (await get_exception(driver) === null)
			throw new std.DomainError("Throwing exception doesn't work.");
	}

	async function validate(driver: ICalculator, validator: Calculator): Promise<void>
	{
		// SPECIFY METHODS
		let method: string = METHODS[std.randint(0, METHODS.length - 1)];
		let x: number = std.randint(1, 10);
		let y: number = std.randint(1, 10);
		
		// CALL FUNCTION & GET ANSWER
		driver; validator;
		let ret = await eval(`driver.${method}`)(x, y);
		let answer = eval(`validator.${method}`)(x, y);

		// VALIDATE
		if (ret !== answer)
			throw new std.DomainError("Error on function calling.");
	}

	export async function get_exception(driver: ICalculator): Promise<string>
	{
		try 
		{ 
			await driver.normal.divides(2, 0); 
		}
		catch (exp) 
		{
			return exp.message; 
		}
		return null;
	}

	const METHODS: string[] = [
		"normal.plus", "normal.minus", "normal.multiplies", "normal.divides",
		"scientific.pow", "scientific.sqrt"
	];
}

