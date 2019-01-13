//================================================================ 
/** @module tgrid.protocols */
//================================================================
export interface IState<State>
{
    /**
     * Current state.
     */
    readonly state: State;
}