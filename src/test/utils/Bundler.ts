import * as fs from "fs";
import * as browserify from "browserify";

export namespace Bundler
{
    export function bundle(path: string, output: string): Promise<string>
    {
        return new Promise((resolve, reject) =>
        {
            let b = browserify([path]);
            b.bundle((err, src) =>
            {
                if (err)
                    reject(err);
                else
                {
                    fs.writeFile(output, src, (err) =>
                    {
                        if (err)
                            reject(err);
                        else
                            resolve();
                    });
                }
            });
        });
    }
}