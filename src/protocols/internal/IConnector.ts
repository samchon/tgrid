//================================================================ 
/** @module tgrid.protocols */
//================================================================
import { DomainError, RuntimeError } from "tstl/exception";

export interface IConnector<State extends IConnector.State>
{
	readonly state: State;

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

export namespace IConnector
{
	export enum State
	{
		NONE = -1,
		CONNECTING,
		OPEN,
		CLOSING,
		CLOSED
	}

	export function inspect(state: State): Error
	{
		// NO ERROR
		if (state === State.OPEN)
			return null;

		// ERROR, ONE OF THEM
		else if (state === State.NONE)
			return new DomainError("Connect first.");
		else if (state === State.CONNECTING)
			return new DomainError("On connecting; wait for a sec.");
		else if (state === State.CLOSING)
			return new RuntimeError("The connection is on closing.");
		else if (state === State.CLOSED)
			return new RuntimeError("The connection has been closed.");

		// UNKNOWN ERROR, IT MAY NOT OCCURED
		else
			return new RuntimeError("Unknown error, but not connected.");
	}
}