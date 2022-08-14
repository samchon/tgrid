import { WorkerServer } from "../../../../../protocols/workers/module";
import { Scientific } from "../../../../providers/Calculator";

async function main(): Promise<void> {
    const server: WorkerServer<object, Scientific> = new WorkerServer();
    await server.open(new Scientific());
}
main().catch((exp) => {
    console.log(exp);
    process.exit(-1);
});
