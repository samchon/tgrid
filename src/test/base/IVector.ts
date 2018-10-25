import * as std from "tstl";
import { Promisify } from "../../base/Promisify";

export type IVector = Promisify<std.Vector<number>>;
export namespace IVector
{
	export async function main(controller: IVector): Promise<void>
	{
		let mySum: number = 0;
		let serverSum: number = 0;

		for (let i: number = 0; i < 10; ++i)
		{
			let val: number = std.randint(1, 10);

			mySum += val;
			await controller.push_back(val);
		}

		for (let i: number = 0; i < await controller.size(); ++i)
			serverSum += await controller.at(i);

		if (mySum !== serverSum)
			throw new std.DomainError("Error on function returning.");
	}
}