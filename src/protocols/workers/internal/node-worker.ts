//================================================================ 
/** @module tgrid.protocols.workers */
//================================================================
import { tmpdir } from "os";
import { sep } from "path";

import { IWorkerCompiler } from "./IWebCompiler";
import { FileSystem } from "./FileSystem";
import { Worker as _Worker } from "./Worker";

/**
 * @hidden
 */
class _NodeWorkerCompiler implements IWorkerCompiler
{
    public async compile(content: string): Promise<string>
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

        await FileSystem.write(path, content);
        return path;
    }

    public execute(jsFile: string): Worker
    {
        return new _Worker(jsFile) as any;
    }

    public async remove(path: string): Promise<void>
    {
        // THE FILE CAN BE REMOVED BY OS AUTOMATICALLY
        try
        {
            await FileSystem.unlink(path);
        }
        catch {}
    }
}

export = new _NodeWorkerCompiler();