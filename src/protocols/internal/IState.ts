//================================================================ 
/** @module tgrid.protocols */
//================================================================
/**
 * @hidden
 */
export interface IState<State>
{
	/**
	 * Current stage.
	 */
	readonly state: State;
}