//================================================================ 
/** @module tgrid.protocols */
//================================================================
import { IState } from "./IState";

export interface IServer<State extends IServer.State> 
    extends IState<IServer.State>
{

}
export namespace IServer
{
    export const enum State
    {
        NONE = -1,
        OPENING,
        OPEN,
        CLOSING,
        CLOSED
    }
}