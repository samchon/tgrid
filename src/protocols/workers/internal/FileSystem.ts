//================================================================ 
/** @module tgrid.protocols.workers */
//================================================================
import * as fs from "fs";

/**
 * @hidden
 */
export namespace FileSystem
{
    export function exists(path: string): Promise<boolean>
    {
        return new Promise(resolve =>
        {
            fs.exists(path, resolve);
        });
    }

    export function mkdir(path: string): Promise<void>
    {
        return new Promise((resolve, reject) =>
        {
            fs.mkdir(path, err =>
            {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }

    export function writeFile(path: string, content: string, encoding: string): Promise<void>
    {
        return new Promise((resolve, reject) =>
        {
            fs.writeFile(path, content, encoding, err =>
            {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }

    export function unlink(path: string): Promise<void>
    {
        return new Promise((resolve, reject) =>
        {
            fs.unlink(path, err =>
            {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
}