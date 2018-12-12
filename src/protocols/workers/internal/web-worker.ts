import { URLVariables } from "../../../utils/URLVariables";

//================================================================ 
/** @module tgrid.protocols.workers */
//================================================================
/**
 * @hidden
 */
export function compile(content: string): string
{
	let blob: Blob = new Blob([content], { type: "application/javascript" });
	return URL.createObjectURL(blob);
}

export function execute(jsFile: string, ...args: string[]): Worker
{
	if (args.length)
	{
		let vars: URLVariables = new URLVariables();
		vars.set("__m_pArgs", JSON.stringify(args));

		jsFile += "?" + vars.toString();
	}
	return new Worker(jsFile);
}