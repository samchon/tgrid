import { ICommunicator } from "./ICommunicator";

export interface IAcceptor extends ICommunicator
{
	/**
	 * Start listening.
	 * 
	 * Start listening data from the remote client. 
	 * 
	 * @param provider A provider for the remote client.
	 */
	listen<Provider extends object>
		(provider: Provider): Promise<void>;
}