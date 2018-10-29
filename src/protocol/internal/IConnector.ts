import { CommunicatorBase } from "../../base/CommunicatorBase";

export interface IConnector<State, Provider extends object>
	extends CommunicatorBase<Provider>
{
	/**
	 * Get state.
	 * 
	 * @return Current state.
	 */
	readonly state: State

	/**
	 * Wait for server to provide.
	 */
	wait(): Promise<void>;

	/**
	 * Wait for server to provide or timeout.
	 * 
	 * @param ms The maximum milliseconds for waiting.
	 * @return Whether awaken by completion or timeout.
	 */
	wait(ms: number): Promise<boolean>;

	/**
	 * Wait for server to provide or time expiration. 
	 * 
	 * @param at The maximum time point to wait.
	 * @return Whether awaken by completion or time expiration.
	 */
	wait(at: Date): Promise<boolean>;
}