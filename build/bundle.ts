import browserify from "browserify";
import fs from "fs";

function bundle(input: string, output: string): Promise<void>
{
    return new Promise((resolve, reject) =>
    {
        const bundler: browserify.BrowserifyObject = browserify(input);
        bundler.external("worker_threads");

        bundler.bundle((err, src) =>
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
    for (const instance of INSTANCES)
        await bundle(`${__dirname}/../dist/test/browser/${instance}.js`, `${__dirname}/../bundle/${instance}.js`);
}
main();