import fs from "fs";

const EXTENSION = __filename.substr(-2);
if (EXTENSION === "js") require("source-map-support").install();

interface IModule {
  [key: string]: () => Promise<void>;
}

async function iterate(path: string): Promise<void> {
  for (const file of await fs.promises.readdir(path)) {
    const location: string = path + "/" + file;
    const stat: fs.Stats = await fs.promises.lstat(location);

    if (file === "utils") console.log(location, stat.isDirectory());

    if (stat.isDirectory() === true && file !== "internal") {
      await iterate(location);
      continue;
    } else if (
      file.substr(-3) !== ".js" ||
      location === __dirname + "/index.js"
    )
      continue;

    const external: IModule = await import(
      location.substr(0, location.length - 3)
    );
    for (const key in external)
      if (key.substr(0, 5) === "test_") {
        // WHEN SPECIALIZED
        if (process.argv[2] && key.replace("test_", "") !== process.argv[2])
          continue;

        // DO TEST
        console.log(key);
        await external[key]();
      }
  }
}

async function main(): Promise<void> {
  //----
  // DO TEST
  //----
  const time: number = Date.now();
  await iterate(__dirname);

  //----
  // TRACE BENCHMARK
  //----
  // ELAPSED TIME
  console.log("----------------------------------------------------------");
  console.log("Success");
  console.log(`  - elapsed time: ${(Date.now() - time).toLocaleString()} ms`);

  // MEMORY USAGE
  const memory: NodeJS.MemoryUsage = process.memoryUsage();
  for (const property in memory) {
    const amount: number =
      memory[property as keyof NodeJS.MemoryUsage] / 10 ** 6;
    console.log(`  - ${property}: ${amount.toLocaleString()} MB`);
  }
}
main().catch((e) => {
  console.log(e);
  process.exit(1);
});
