//================================================================ 
/** @module tgrid.protocols */
//================================================================
import { DomainError, RuntimeError } from "tstl/exception";

/**
 * @hidden
 */
export interface IAcceptor<State extends IAcceptor.State, Provider extends object>
{
	readonly state: State;

	accept(provider: Provider): Promise<void>;
}

export namespace IAcceptor
{
	export enum State
	{
		NONE = -1,
		ACCEPTING,
		OPEN,
		REJECTING,
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
			return new DomainError("Not accepted yet.");
		else if (state === State.ACCEPTING)
			return new DomainError("On accepting; wait for a sec.");
		else if (state === State.REJECTING || State.CLOSING)
			return new RuntimeError("The connection is on closing.");
		else if (state === State.CLOSED)
			return new RuntimeError("The connection has been closed.");

		// UNKNOWN ERROR, IT MAY NOT OCCURED
		else
			return new RuntimeError("Unknown error, but not connected.");
	}
}