import * as std from "tstl";

export class NormalCalculator
{
	public plus(x: number, y: number): number
	{
		return std.plus(x, y);
	}
	public minus(x: number, y: number): number
	{
		return std.minus(x, y);
	}

	public multiplies(x: number, y: number): number
	{
		return std.multiplies(x, y);
	}
	public divides(x: number, y: number): number
	{
		if (y === 0)
			throw new std.DomainError("Unable to divide by zero.");

		return std.divides(x, y);
	}
}