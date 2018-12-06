import { WorkerServer } from "../../../protocols/workers/WorkerServer";
import { Calculator } from "../../internal/Calculator";

function main(): void
{
	new WorkerServer(new Calculator());
}
main();