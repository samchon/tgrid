import { WorkerServer } from "../../../protocol/worker/WorkerServer";
import { Calculator } from "../../internal/Calculator";

function main(): void
{
	new WorkerServer(new Calculator());
}
main();