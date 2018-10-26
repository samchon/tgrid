import * as std from "tstl";

import { Driver } from "../../base/Driver";
import { Calculator } from "./Calculator";

export type ICalculator = Driver<Calculator>;

export namespace ICalculator
{
	export async function main(controller: ICalculator, talk: boolean = false): Promise<void>
	{
		// VALIDATOR
		let validator: Calculator = new Calculator();

		// CALL FUNCTIONS IN SERVER FROM CLIENT
		for (let i: number = 0; i < 100; ++i)
			validate(controller, validator, talk);

		// EXCEPTION THROWN BY THE SERVER
		if (await get_exception(controller) === null)
			throw new std.DomainError("Throwing exception doesn't work.");
	}

	async function validate(controller: ICalculator, validator: Calculator, talk: boolean): Promise<void>
	{
		if (controller === <any>validator)
			throw new std.InvalidArgument("Mistaken arguments.");

		// SPECIFY METHODS
		let method: string = METHODS[std.randint(0, METHODS.length - 1)];
		let x: number = std.randint(2, 10);
		let y: number = std.randint(2, 10);

		// CALL FUNCTION & GET ANSWER
		let ret: number = await eval(`controller.${method}`)(x, y);
		let answer: number = eval(`validator.${method}(x, y)`);

		if (talk)
			console.log(method, x, y, ret, answer);
		
		// VALIDATE
		if (ret !== answer)
			throw new std.DomainError("Error on function calling.");
	}

	export async function get_exception(controller: ICalculator): Promise<string>
	{
		try 
		{ 
			await controller.divides(2, 0); 
		}
		catch (exp) 
		{
			return exp.message; 
		}
		return null;
	}

	const METHODS: string[] = [
		/*"plus", "minus", "multiplies", "divides",
		"scientific.pow", "scientific.log", "scientific.sqrt",
		"statistics.mean", */"statistics.stdev"
	];
}

