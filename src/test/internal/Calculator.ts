export class Calculator
{
	public scientific = new Scientific();
	public statistics = new Statistics();

	public plus(x: number, y: number): number
	{
		return x + y;
	}
	public minus(x: number, y: number): number
	{
		return x - y;
	}
	
	public multiplies(x: number, y: number): number
	{
		return x * y;
	}
	public divides(x: number, y: number): number
	{
		if (y === 0)
			throw new Error("Divided by zero.");
		return x / y;
	}
}

class Scientific
{
	public pow(x: number, y: number): number
	{
		return Math.pow(x, y);
	}

	public log(x: number, y: number): number
	{
		if (x < 0 || y < 0)
			throw new Error("Negative value on log.");
		return Math.log(y) / Math.log(x);
	}

	public sqrt(x: number): number
	{
		if (x < 0)
			throw new Error("Negative value on sqaure.");
		return Math.sqrt(x);
	}
}

class Statistics
{
	public mean(...elems: number[]): number
	{
		let ret: number = 0;
		for (let val of elems)
			ret += val;
		return ret / elems.length;
	}

	public stdev(...elems: number[]): number
	{
		let mean: number = this.mean(...elems);
		let ret: number = 0;

		for (let val of elems)
			ret += Math.pow(val - mean, 2);

		return Math.sqrt(ret / elems.length);
	}
}