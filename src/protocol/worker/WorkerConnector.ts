import { CommunicatorBase } from "../../base/CommunicatorBase";
import { Invoke } from "../../base/Invoke";

import { is_node } from "tstl/utility/node";

export declare class WorkerConnector<Listener extends object = {}>
	extends CommunicatorBase<Listener>
{
	/**
	 * @hidden
	 */
	private worker_;

	public constructor(listener?: Listener);

	public connect(jsFile: string): void;
	public close(): void;

	public sendData(invoke: Invoke): void;
}

exports.WorkerConnector = is_node()
	? require("./internal/ProcessConnector").ProcessConnector
	: require("./internal/WorkerConnector").WorkerConnector;