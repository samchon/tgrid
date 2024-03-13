import browserify, { BrowserifyObject } from "browserify";
import fs from "fs";

export namespace TestBundler {
  function bundle(input: string, output: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const bundler: BrowserifyObject = browserify(input);
      bundler.external("worker_threads");
      bundler.bundle((err, src) => {
        if (err) reject(err);
        else {
          fs.writeFile(output, src, (err) => {
            if (err) reject(err);
            else resolve();
          });
        }
      });
    });
  }

  export async function execute(): Promise<void> {
    const INSTANCES = [
      "worker-server",
      "worker-client",
      "shared-worker-server",
      "shared-worker-client",
      "web-client",
    ];
    for (const instance of INSTANCES)
      await bundle(
        `${__dirname}/${instance}.js`,
        `${__dirname}/../../../bundle/${instance}.js`,
      );
  }
}
