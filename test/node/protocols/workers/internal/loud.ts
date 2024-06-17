import { WorkerServer } from "tgrid";

import { IScientific } from "../../../../controllers/ICalculator";

class ScientificCalculator implements IScientific {
  public pow(x: number, y: number): number {
    console.log("pow", x, y);
    return Math.pow(x, y);
  }
  public sqrt(x: number): number {
    console.log("sqrt", x);
    return Math.sqrt(x);
  }
  public log(x: number, y: number): number {
    console.log("log", x, y);
    return Math.log(x) / Math.log(y);
  }
}

async function main(): Promise<void> {
  const server = new WorkerServer();
  await server.open(new ScientificCalculator());
}
main().catch((exp) => {
  console.log(exp);
  process.exit(-1);
});
