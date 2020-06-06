//================================================================ 
/** @module tgrid.protocols.workers */
//================================================================
import { IWorkerCompiler } from "./IWebCompiler";
import { URLVariables } from "../../../utils/URLVariables";

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

    public execute<Headers extends object>
        (jsFile: string, headers: Headers): Worker
    {
        let vars: URLVariables = new URLVariables();
        vars.set("__m_stHeaders", JSON.stringify(headers));
    
        jsFile += "?" + vars.toString();
        return new Worker(jsFile);
    }
}

export = new _WebWorkerCompiler();