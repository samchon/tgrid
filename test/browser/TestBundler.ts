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
    const browserRoot: string = __filename.endsWith(".ts")
      ? path.resolve(process.cwd(), "bin/browser/test/browser")
      : path.resolve(__dirname, "../../browser/test/browser");
    const nodeRoot: string = __filename.endsWith(".ts")
      ? path.resolve(process.cwd(), "bin/test/browser")
      : __dirname;
    const bundleRoot: string = path.resolve(process.cwd(), "bundle");

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
        `${browserRoot}/${instance}.js`,
        `${bundleRoot}/${instance}.js`,
      );

    // NODE SIDE WORKER SCRIPT
    //
    // compiled by the `test/tsconfig.json` with the node platform, and
    // bundled into a single file to be compiled by `WorkerConnector.compile()`
    await bundle(
      `${nodeRoot}/worker-server.js`,
      `${bundleRoot}/worker-server.node.js`,
      { node: true, ignoreMissing: true },
    );
  }
}
