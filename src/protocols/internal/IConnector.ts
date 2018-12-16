import { IState } from "./IState";

//================================================================ 
/** @module tgrid.protocols */
//================================================================
/**
 * @hidden
 */
export interface IConnector<State> 
	extends IState<State>
{
	/**
	 * Wait server to provide.
	 * 
	 * Wait server to specify its `Provider` permanently. 
	 */
	wait(): Promise<void>;

	/**
	 * Wait server to provide or timeout.
	 * 
	 * Wait server to specify its `Provider` for specified milliseconds.
	 * 
	 * @param ms The maximum milliseconds for waiting.
	 * @return Whether awaken by completion or timeout.
	 */
	wait(ms: number): Promise<boolean>;

	/**
	 * Wait server to provide or time expiration. 
	 * 
	 * Wait server to specify its `Provider` until time expiration.
	 * 
	 * @param at The maximum time point to wait.
	 * @return Whether awaken by completion or time expiration.
	 */
	wait(at: Date): Promise<boolean>;
}