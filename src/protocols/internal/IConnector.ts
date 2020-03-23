//================================================================ 
/** @module tgrid.protocols */
//================================================================
import { IState } from "./IState";
import { DomainError } from "tstl/exception/DomainError";
import { RuntimeError } from "tstl/exception/RuntimeError";

export interface IConnector<State extends IConnector.State>
    extends IState<State>
{
}

/**
 * @hidden
 */
export namespace IConnector
{
    export const enum State
    {
        NONE = -1,
        CONNECTING,
        OPEN,
        CLOSING,
        CLOSED
    }

    export function inspect(state: State, method: string): Error | null
    {
        // NO ERROR
        if (state === State.OPEN)
            return null;

        // ERROR, ONE OF THEM
        else if (state === State.NONE)
            return new DomainError(`Error on ${method}(): connect first.`);
        else if (state === State.CONNECTING)
            return new DomainError(`Error on ${method}(): it's on connecting, wait for a second.`);
        else if (state === State.CLOSING)
            return new RuntimeError(`Error on ${method}(): the connection is on closing.`);
        else if (state === State.CLOSED)
            return new RuntimeError(`Error on ${method}(): the connection has been closed.`);

        // UNKNOWN ERROR, IT MAY NOT OCCURED
        else
            return new RuntimeError(`Error on ${method}(): unknown error, but not connected.`);
    }
}