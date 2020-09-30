import { 
    ICalculator, 
    ISimple, IScientific, IStatistics
} from "../controllers/ICalculator";

export class Simple 
    implements ISimple
{
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

export class Calculator 
    extends Simple 
    implements ICalculator
{
    public scientific = new Scientific();
    public statistics = new Statistics();
}

export class Scientific implements IScientific
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

export class Statistics implements IStatistics
{
    public mean(...elems: number[]): number
    {
        let ret: number = 0;
        for (const val of elems)
            ret += val;
        return ret / elems.length;
    }

    public stdev(...elems: number[]): number
    {
        const mean: number = this.mean(...elems);
        let ret: number = 0;

        for (const val of elems)
            ret += Math.pow(val - mean, 2);

        return Math.sqrt(ret / elems.length);
    }
}