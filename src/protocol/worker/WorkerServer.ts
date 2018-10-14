import { CommunicatorBase } from "../../base/CommunicatorBase";
import { Invoke } from "../../base/Invoke";

import { is_node } from "tstl/utility/node";

export declare class WorkerServer<Listener extends object = {}> 
	extends CommunicatorBase<Listener>
{
	public constructor(listener?: Listener);

	public close(): void;
	public sendData(invoke: Invoke): void;
}

exports.WorkerServer = is_node()
	? require("./internal/ProcessServer").ProcessServer
	: require("./internal/WorkerServer").WorkerServer;