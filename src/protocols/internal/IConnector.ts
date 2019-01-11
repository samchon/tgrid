//================================================================ 
/** @module tgrid.protocols */
//================================================================
import { DomainError, RuntimeError } from "tstl/exception";

/**
 * @hidden
 */
export interface IConnector<State extends IConnector.State>
{
    readonly state: State;
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