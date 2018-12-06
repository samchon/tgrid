//================================================================ 
/** @module tgrid.protocols */
//================================================================
/**
 * @hidden
 */
export interface IAcceptor
{
	/**
	 * Start listening.
	 * 
	 * Start listening data from the remote client. 
	 * 
	 * @param provider A provider for the remote client.
	 */
	listen<Provider extends object>
		(provider: Provider): Promise<void>;
}