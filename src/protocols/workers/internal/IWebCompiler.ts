//================================================================ 
/** @module tgrid.protocols.workers */
//================================================================
/**
 * @hidden
 */
export interface IWorkerCompiler
{
    compile(content: string): Promise<string>;
    remove(path: string): Promise<void>;
    execute<Headers extends object>(jsFile: string, headers: Headers): Worker;
}