/** 
 * @packageDocumentation
 * @module tgrid.protocols.workers
 */
//----------------------------------------------------------------
/**
 * @hidden
 */
export interface IWorkerCompiler
{
    compile(content: string): Promise<string>;
    remove(path: string): Promise<void>;
    execute(jsFile: string, argv: string[] | undefined): Promise<Worker>;
}

/**
 * @hidden
 */
export namespace IWorkerCompiler {
    export type Creator = {
        new(jsFile: string, execArgv: string[] | undefined): IWorkerCompiler;
    }
}