//================================================================ 
/** @module tgrid.protocol.worker */
//================================================================
/**
 * @hidden
 */
export function compile(content: string): string
{
	let blob: Blob = new Blob([content], { type: "application/javascript" });
	return URL.createObjectURL(blob);
}