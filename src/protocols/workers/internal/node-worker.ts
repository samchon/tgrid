//================================================================ 
/** @module tgrid.protocols.workers */
//================================================================
import { tmpdir } from "os";
import { sep } from "path";

import { FileSystem } from "./FileSystem";
import { Worker as _Worker } from "./Worker";

/* ----------------------------------------------------------------
    GLOBAL FUNCTIONS
---------------------------------------------------------------- */
/**
 * @hidden
 */
export async function compile(content: string): Promise<string>
{
    let path: string = tmpdir() + sep + "tgrid";
    if (await FileSystem.exists(path) === false)
        await FileSystem.mkdir(path);

    while (true)
    {
        let myPath: string = path + sep + `${new Date().getTime()}_${Math.random()}_${Math.random()}.js`; 
        if (await FileSystem.exists(myPath) === false)
        {
            path = myPath;
            break;
        }
    }

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

/**
 * @hidden
 */
export async function remove(path: string): Promise<void>
{
    // THE FILE CAN BE REMOVED BY OS AUTOMATICALLY
    try
    {
        await FileSystem.unlink(path);
    }
    catch {}
}
