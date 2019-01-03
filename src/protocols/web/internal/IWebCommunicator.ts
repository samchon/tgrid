//================================================================ 
/** @module tgrid.protocols.web */
//================================================================
export interface IWebCommunicator
{
	readonly protocol: string;
	readonly extensions: string;

	/**
	 * Close connection.
	 * 
	 * Close connection with the remote websocket server and destroy all remote function
	 * calls those are not returned (finished) yet. It would also destroy all the remote 
	 * function calls in the remote system (by `Driver<Controller`>), too.
	 * 
	 * If parameters *code* and *reason* are specified, it means the disconnection is 
	 * abnormal and it would throw exceptions (`WebError`) to the unreturned remote 
	 * function calls.
	 * 
	 * @param code Closing code.
	 * @param reason Reason why.
	 */
	close(code?: number, reason?: string): Promise<void>
}