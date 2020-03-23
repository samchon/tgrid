//================================================================ 
/** @module tgrid.protocols */
//================================================================
import { IState } from "./IState";
import { DomainError } from "tstl/exception/DomainError";
import { RuntimeError } from "tstl/exception/RuntimeError";

export interface IAcceptor<State extends IAcceptor.State, Provider extends object>
    extends IState<State>
{
    /**
     * Accept connection.
     *
     * Accept, permit the client's, connection with this server and start interaction.
     * 
     * @param provider An object providing features to remote system.
     */
    accept(provider: Provider | null): Promise<void>;
}

export namespace IAcceptor
{
    export const enum State
    {
        REJECTING = -2,
        NONE,
        ACCEPTING,
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
            return new DomainError(`Error on ${method}(): not accepted yet.`);
        else if (state === State.ACCEPTING)
            return new DomainError(`Error on ${method}(): it's on accepting, wait for a second.`);
        else if (state === State.REJECTING || State.CLOSING)
            return new RuntimeError(`Error on ${method}(): the connection is on closing.`);
        else if (state === State.CLOSED)
            return new RuntimeError(`Error on ${method}(): the connection has been closed.`);

        // UNKNOWN ERROR, IT MAY NOT OCCURED
        else
            return new RuntimeError(`Error on ${method}(): unknown error, but not connected.`);
    }
}