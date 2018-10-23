import * as fs from "fs";
import { sep } from "path";

/**
 * @hidden
 */
export function compile(content: string): string
{
	let path: string = __dirname + sep + "temp";
	if (!fs.existsSync(path))
		fs.mkdirSync(path);

	path += sep + `${new Date().getTime()}_${Math.random()}_${Math.random()}.js`;
	fs.writeFileSync(path, content, "utf8");

	// setTimeout(() =>
	// {
	// 	fs.unlinkSync(path);
	// }, 5000);

	return path;
}