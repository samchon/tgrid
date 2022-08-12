/** 
 * @packageDocumentation
 * @module tgrid.protocols.workers
 */
//----------------------------------------------------------------
import { IWorkerCompiler } from "./IWorkerCompiler";

/**
 * @hidden
 */
export const WebWorkerCompiler: IWorkerCompiler =
{
    compile: async content =>
    {
        const blob: Blob = new Blob([content], { type: "application/javascript" });
        return window.URL.createObjectURL(blob);
    },

    remove: async url =>
    {
        // THE FILE CAN BE REMOVED BY BROWSER AUTOMATICALLY
        try
        {
            window.URL.revokeObjectURL(url);
        }
        catch {}
    },

    execute: jsFile =>
    {
        return new Worker(jsFile);
    }
}