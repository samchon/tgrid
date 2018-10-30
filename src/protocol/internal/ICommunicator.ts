/**
 * @hidden
 */
export interface ICommunicator
{
	/**
	 * Close handler.
	 * 
	 * A function called when the connection has been closed. It doesn't matter who've closed the connection, whether user or remote system.
	 */
	handleClose: (code: number, reason: string) => void;
}