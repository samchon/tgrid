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
    execute(jsFile: string, argv: string[] | undefined): Worker;
}