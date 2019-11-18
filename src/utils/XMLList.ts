import { Vector } from "tstl/container/Vector";
import { XML } from "./XML";

export class XMLList extends Vector<XML>
{
	public getTag(): string
	{
		return this.front().getTag();
	}

	
	public toString(): string;
	
	/**
	 * @internal
	 */
	public toString(level: number): string;
	
	public toString(level: number = 0): string
	{
		let ret: string = "";
		for (let xml of this)
			ret += xml.toString(level) + "\n";
		
		return ret;
	}
}

export namespace XMLList 
{
	export type Iterator = Vector.Iterator<XML>;
	export type ReverseIterator = Vector.ReverseIterator<XML>;
}
