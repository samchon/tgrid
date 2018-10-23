import { WorkerServer } from "../../../protocol/worker/WorkerServer";
import { Calculator } from "../../base/Calculator";

function main(): void
{
	new WorkerServer(new Calculator());
}
main();