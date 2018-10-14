
import { NormalCalculator } from "./NormalCalculator";
import { ScientificCalculator } from "./ScientificCalculator";

export class Calculator
{
	public normal = new NormalCalculator();
	public scientific = new ScientificCalculator();
}