//================================================================ 
/** @module tgrid.protocols.workers */
//================================================================
import * as cp from "child_process";
import * as fs from "fs";
import { sep } from "path";

/* ----------------------------------------------------------------
	GLOBAL FUNCTIONS
---------------------------------------------------------------- */
/**
 * @hidden
 */
export async function compile(content: string): Promise<string>
{
	let path: string = __dirname + sep + "temp";
	if (await FileSystem.exists(path) === false)
		await FileSystem.mkdir(path);

	path += sep + `${new Date().getTime()}_${Math.random()}_${Math.random()}.js`;
	await FileSystem.writeFile(path, content, "utf8");

	return path;
}

/**
 * @hidden
 */
export function execute(jsFile: string, ...args: string[]): Worker
{
	return new _Worker(jsFile, ...args) as any;
}

/* ----------------------------------------------------------------
	WORKER-POLYFILL
---------------------------------------------------------------- */
/**
 * @hidden
 */
class _Worker
{
	private process_: cp.ChildProcess;

	public constructor(jsFile: string, ...args: string[])
	{
		this.process_ = cp.fork(jsFile, args);
	}

	public terminate(): void
	{
		this.process_.kill();
	}

	public set onmessage(listener: (event: MessageEvent) => void)
	{
		this.process_.on("message", message =>
		{
			listener({data: message} as MessageEvent);
		});
	}

	public postMessage(message: any): void
	{
		this.process_.send(message);
	}
}

/**
 * @hidden
 */
export function remove(path: string): Promise<void>
{
	return FileSystem.unlink(path);
}

/* ----------------------------------------------------------------
	FILESYSTEM
---------------------------------------------------------------- */
/**
 * @hidden
 */
namespace FileSystem
{
	export function exists(path: string): Promise<boolean>
	{
		return new Promise(resolve =>
		{
			fs.exists(path, resolve);
		});
	}

	export function mkdir(path: string): Promise<void>
	{
		return new Promise((resolve, reject) =>
		{
			fs.mkdir(path, err =>
			{
				if (err)
					reject(err);
				else
					resolve();
			});
		});
	}

	export function writeFile(path: string, content: string, encoding: string): Promise<void>
	{
		return new Promise((resolve, reject) =>
		{
			fs.writeFile(path, content, encoding, err =>
			{
				if (err)
					reject(err);
				else
					resolve();
			});
		});
	}

	export function unlink(path: string): Promise<void>
	{
		return new Promise((resolve, reject) =>
		{
			fs.unlink(path, err =>
			{
				if (err)
					reject(err);
				else
					resolve();
			});
		});
	}
}