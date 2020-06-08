//================================================================ 
/** @module tgrid.protocols.workers */
//================================================================
import { IWorkerCompiler } from "./IWebCompiler";

/**
 * @hidden
 */
class _WebWorkerCompiler implements IWorkerCompiler
{
    public async compile(content: string): Promise<string>
    {
        let blob: Blob = new Blob([content], { type: "application/javascript" });
        return window.URL.createObjectURL(blob);
    }

    public async remove(url: string): Promise<void>
    {
        // THE FILE CAN BE REMOVED BY BROWSER AUTOMATICALLY
        try
        {
            window.URL.revokeObjectURL(url);
        }
        catch {}
    }

    public execute(jsFile: string): Worker
    {
        return new Worker(jsFile);
    }
}

export = new _WebWorkerCompiler();