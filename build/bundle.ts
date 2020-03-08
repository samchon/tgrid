import fs = require("fs");
import browserify = require('browserify');

function bundle(path: string, output: string): Promise<void>
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

async function main(): Promise<void>
{
    const INSTANCES = 
    [
        "worker-server",
        "worker-client",
        "shared-worker-server",
        "shared-worker-client",
        "web-client"
    ];
    for (let instance of INSTANCES)
        await bundle(`${__dirname}/../dist/test/browser/${instance}.js`, `${__dirname}/../bundle/${instance}.js`);
}
main();