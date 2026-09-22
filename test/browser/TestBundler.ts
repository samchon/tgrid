import browserify, { BrowserifyObject, Options } from "browserify";
import fs from "fs";
import path from "path";

export namespace TestBundler {
  function bundle(
    input: string,
    output: string,
    options?: Options,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const bundler: BrowserifyObject = browserify(input, options);
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
    const root: string = path.resolve(__dirname, "../..");

    // BROWSER SIDE SCRIPTS
    //
    // compiled by the `test/browser/tsconfig.json`, which resolves the
    // `#platform` alias to the browser platform
    const INSTANCES = [
      "worker-server",
      "worker-client",
      "shared-worker-server",
      "shared-worker-client",
      "web-client",
    ];
    for (const instance of INSTANCES)
      await bundle(
        `${root}/bin/browser/test/browser/${instance}.js`,
        `${root}/bundle/${instance}.js`,
      );

    // NODE SIDE WORKER SCRIPT
    //
    // compiled by the `test/tsconfig.json` with the node platform, and
    // bundled into a single file to be compiled by `WorkerConnector.compile()`
    await bundle(
      `${root}/bin/test/browser/worker-server.js`,
      `${root}/bundle/worker-server.node.js`,
      { node: true, ignoreMissing: true },
    );
  }
}
