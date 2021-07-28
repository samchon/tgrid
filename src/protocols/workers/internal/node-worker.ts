/** 
 * @packageDocumentation
 * @module tgrid.protocols.workers
 */
//----------------------------------------------------------------
import { tmpdir } from "os";
import { v4 } from "uuid";

import { FileSystem } from "./FileSystem";
import { IWorkerCompiler } from "./IWebCompiler";
import { ThreadWorker } from "./threads/ThreadWorker";

/**
 * @hidden
 */
class _NodeWorkerCompiler implements IWorkerCompiler
{
    public async compile(content: string): Promise<string>
    {
        let path: string = `${tmpdir().split("\\").join("/")}/tgrid`;
        if (await FileSystem.exists(path) === false)
            await FileSystem.mkdir(path);

        while (true)
        {
            const myPath: string = `${path}/${v4()}.js`; 
            if (await FileSystem.exists(myPath) === false)
            {
                path = myPath;
                break;
            }
        }

        await FileSystem.write(path, content);
        return path;
    }

    public execute(jsFile: string, execArgv: string[] | undefined): Worker
    {
        return new ThreadWorker(jsFile, execArgv) as any;
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