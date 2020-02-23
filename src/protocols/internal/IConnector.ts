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

    export function inspect(state: State): Error | null
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