/** 
 * @packageDocumentation
 * @module tgrid.protocols.workers
 */
//----------------------------------------------------------------
import type __os from "os";
import { is_node } from "tstl/utility/node";
import { v4 } from "uuid";

const os: typeof __os = is_node() ? require("os") : null!;

import { FileSystem } from "./FileSystem";
import { IWorkerCompiler } from "./IWorkerCompiler";
import { ProcessWorker } from "./processes/ProcessWorker";
import { ThreadWorker } from "./threads/ThreadWorker";

/**
 * @hidden
 */
export class NodeWorkerCompiler implements IWorkerCompiler
{
    private factory_: Creator<ProcessWorker | ThreadWorker>;

    public constructor(type: "process" | "thread")
    {
        this.factory_ = (type === "process")
            ? ProcessWorker
            : ThreadWorker;
    }

    public async compile(content: string): Promise<string>
    {
        let path: string = `${os.tmpdir().split("\\").join("/")}/tgrid`;
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
        return new this.factory_(jsFile, execArgv) as any;
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

type Creator<T extends object> =
{
    new(...args: any[]): T;
};